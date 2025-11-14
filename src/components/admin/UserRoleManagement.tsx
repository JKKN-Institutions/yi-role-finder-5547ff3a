import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2, Shield, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

const AVAILABLE_ROLES = ['admin', 'chair', 'co_chair', 'em'] as const;

const ROLE_LABELS = {
  admin: 'Admin',
  chair: 'Chair',
  co_chair: 'Co-Chair',
  em: 'EM'
};

export const UserRoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*')
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (rolesResponse.error) throw rolesResponse.error;

      setUsers(usersResponse.data || []);
      setUserRoles(rolesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(role => role.user_id === userId).map(role => role.role);
  };

  const hasRole = (userId: string, role: string) => {
    return getUserRoles(userId).includes(role);
  };

  const handleAddRole = async (userId: string, role: string) => {
    if (hasRole(userId, role)) {
      toast.info('User already has this role');
      return;
    }

    setProcessingUserId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-role', {
        body: {
          action: 'add',
          userId,
          role
        }
      });

      if (error) throw error;

      toast.success(`Role ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]} assigned successfully`);
      await fetchData();
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast.error(error.message || 'Failed to assign role');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setProcessingUserId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-role', {
        body: {
          action: 'remove',
          userId,
          role
        }
      });

      if (error) throw error;

      toast.success(`Role ${ROLE_LABELS[role as keyof typeof ROLE_LABELS]} removed successfully`);
      await fetchData();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(error.message || 'Failed to remove role');
    } finally {
      setProcessingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">User Role Management</h2>
          <p className="text-sm text-muted-foreground">
            Assign and manage administrative roles for users
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          <strong>Available Roles:</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Admin - Full system access</Badge>
          <Badge variant="outline">Chair - Leadership access</Badge>
          <Badge variant="outline">Co-Chair - Leadership access</Badge>
          <Badge variant="outline">EM - Event management access</Badge>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Roles</TableHead>
            <TableHead>Assign Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const roles = getUserRoles(user.id);
            const isProcessing = processingUserId === user.id;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'No name'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <Badge key={role} variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No roles</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAddRole(user.id, selectedRole)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRole(user.id, role)}
                        disabled={isProcessing}
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Remove {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found
        </div>
      )}
    </Card>
  );
};
