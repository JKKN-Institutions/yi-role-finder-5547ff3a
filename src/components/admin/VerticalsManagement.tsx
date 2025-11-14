import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Upload } from "lucide-react";

interface Vertical {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
}

export const VerticalsManagement = () => {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVertical, setEditingVertical] = useState<Vertical | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Array<{ name: string; description: string; warnings: string[] }>>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchVerticals();
  }, []);

  const fetchVerticals = async () => {
    try {
      const { data, error } = await supabase
        .from("verticals")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setVerticals(data || []);
    } catch (error) {
      console.error("Error fetching verticals:", error);
      toast.error("Failed to load verticals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const maxOrder = Math.max(...verticals.map(v => v.display_order), 0);
      const { error } = await supabase.from("verticals").insert({
        ...formData,
        display_order: maxOrder + 1,
      });

      if (error) throw error;
      toast.success("Vertical created successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchVerticals();
    } catch (error) {
      console.error("Error creating vertical:", error);
      toast.error("Failed to create vertical");
    }
  };

  const handleUpdate = async () => {
    if (!editingVertical) return;

    try {
      const { error } = await supabase
        .from("verticals")
        .update({
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
        })
        .eq("id", editingVertical.id);

      if (error) throw error;
      toast.success("Vertical updated successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchVerticals();
    } catch (error) {
      console.error("Error updating vertical:", error);
      toast.error("Failed to update vertical");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vertical?")) return;

    try {
      const { error } = await supabase.from("verticals").delete().eq("id", id);

      if (error) throw error;
      toast.success("Vertical deleted successfully");
      fetchVerticals();
    } catch (error) {
      console.error("Error deleting vertical:", error);
      toast.error("Failed to delete vertical");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("verticals")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Vertical ${!currentStatus ? "activated" : "deactivated"}`);
      fetchVerticals();
    } catch (error) {
      console.error("Error toggling vertical:", error);
      toast.error("Failed to update vertical");
    }
  };

  const openEditDialog = (vertical: Vertical) => {
    setEditingVertical(vertical);
    setFormData({
      name: vertical.name,
      description: vertical.description,
      is_active: vertical.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVertical(null);
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
  };

  const downloadTemplate = () => {
    const csvContent = `name,description
Climate Change,Working on climate solutions and sustainability
Education Technology,Improving access to education through technology
Healthcare Innovation,Advancing healthcare delivery and accessibility
Social Impact,Creating positive social change in communities
Economic Development,Fostering economic growth and opportunity`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'verticals_template.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Template downloaded successfully");
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handlePreviewCSV = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
      
      const parsed = lines.slice(startIndex).map((line) => {
        const [name, description] = parseCSVLine(line);
        const warnings: string[] = [];
        
        if (!name) {
          warnings.push("Missing name");
        } else if (name.length > 100) {
          warnings.push("Name too long (max 100 characters)");
        }
        
        if (!description) {
          warnings.push("Missing description");
        } else if (description.length > 1000) {
          warnings.push("Description too long (max 1000 characters)");
        }
        
        return {
          name: name || '',
          description: description || '',
          warnings
        };
      });

      // Check for duplicates
      const nameCount = new Map<string, number>();
      parsed.forEach(item => {
        if (item.name) {
          nameCount.set(item.name, (nameCount.get(item.name) || 0) + 1);
        }
      });
      
      parsed.forEach(item => {
        if (item.name && nameCount.get(item.name)! > 1) {
          item.warnings.push("Duplicate name in CSV");
        }
      });

      setPreviewData(parsed);
      setShowPreview(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    }
  };

  const handleBulkUpload = async (replaceAll: boolean = false) => {
    try {
      const validVerticals = previewData.filter(v => v.name && v.warnings.length === 0);
      
      if (validVerticals.length === 0) {
        toast.error("No valid verticals to upload");
        return;
      }

      const verticalsToInsert = validVerticals.map((v, index) => ({
        name: v.name,
        description: v.description,
        display_order: index + 1,
        is_active: true,
      }));

      // If replace all, delete existing verticals first
      if (replaceAll) {
        const { error: deleteError } = await supabase
          .from("verticals")
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) throw deleteError;
      }

      const { error } = await supabase.from("verticals").insert(verticalsToInsert);

      if (error) throw error;
      
      toast.success(`Successfully ${replaceAll ? 'replaced' : 'uploaded'} ${verticalsToInsert.length} verticals`);
      setIsBulkUploadOpen(false);
      setCsvFile(null);
      setPreviewData([]);
      setShowPreview(false);
      fetchVerticals();
    } catch (error) {
      console.error("Error uploading verticals:", error);
      toast.error("Failed to upload verticals");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Verticals Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage Yi verticals and their descriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {showPreview ? 'Preview Upload' : 'Bulk Upload Verticals'}
                </DialogTitle>
              </DialogHeader>
              {!showPreview ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Upload CSV File</label>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={downloadTemplate}
                        className="h-auto p-0 text-xs"
                      >
                        Download Template
                      </Button>
                    </div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        setCsvFile(e.target.files?.[0] || null);
                        setShowPreview(false);
                        setPreviewData([]);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      CSV format: name, description (one vertical per line)
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsBulkUploadOpen(false);
                      setCsvFile(null);
                      setShowPreview(false);
                      setPreviewData([]);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePreviewCSV} 
                      disabled={!csvFile}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {previewData.filter(v => v.warnings.length === 0).length} valid verticals found
                        {previewData.filter(v => v.warnings.length > 0).length > 0 && 
                          ` (${previewData.filter(v => v.warnings.length > 0).length} with warnings)`
                        }
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setShowPreview(false);
                          setPreviewData([]);
                        }}
                      >
                        Back to Upload
                      </Button>
                    </div>
                    <div className="border rounded-md max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead className="w-48">Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-32">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((item, index) => (
                            <TableRow key={index} className={item.warnings.length > 0 ? 'bg-destructive/10' : ''}>
                              <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                              <TableCell className="font-medium truncate max-w-[200px]" title={item.name}>
                                {item.name || <span className="text-muted-foreground italic">Empty</span>}
                              </TableCell>
                              <TableCell className="text-xs truncate max-w-md" title={item.description}>
                                {item.description || <span className="text-muted-foreground italic">Empty</span>}
                              </TableCell>
                              <TableCell>
                                {item.warnings.length === 0 ? (
                                  <span className="text-xs text-green-600">Valid</span>
                                ) : (
                                  <div className="text-xs text-destructive space-y-1">
                                    {item.warnings.map((warning, i) => (
                                      <div key={i}>• {warning}</div>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsBulkUploadOpen(false);
                      setCsvFile(null);
                      setShowPreview(false);
                      setPreviewData([]);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleBulkUpload(false)} 
                      disabled={previewData.filter(v => v.warnings.length === 0).length === 0}
                    >
                      Add to Existing
                    </Button>
                    <Button 
                      onClick={() => handleBulkUpload(true)} 
                      disabled={previewData.filter(v => v.warnings.length === 0).length === 0}
                    >
                      Replace All
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vertical
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVertical ? "Edit Vertical" : "Create New Vertical"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Climate Change"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the vertical"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Active</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingVertical ? handleUpdate : handleCreate}
                  disabled={!formData.name || !formData.description}
                  className="flex-1"
                >
                  {editingVertical ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verticals.map((vertical) => (
            <TableRow key={vertical.id}>
              <TableCell>
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
              </TableCell>
              <TableCell className="font-medium">{vertical.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {vertical.description}
              </TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={vertical.is_active}
                  onCheckedChange={() =>
                    handleToggleActive(vertical.id, vertical.is_active)
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(vertical)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(vertical.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {verticals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No verticals yet. Create your first one!
        </div>
      )}
    </Card>
  );
};
