import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, FileEdit, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TimelineEvent {
  id: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
  user_id: string | null;
}

interface CandidateTimelineProps {
  assessmentId: string;
}

export const CandidateTimeline = ({ assessmentId }: CandidateTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [assessmentId]);

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("resource_id", assessmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case "status_change":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "notes_updated":
        return <FileEdit className="w-4 h-4 text-blue-500" />;
      case "reviewed":
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventDescription = (event: TimelineEvent) => {
    const details = event.details || {};
    switch (event.action) {
      case "status_change":
        return `Status changed from "${details.from || 'N/A'}" to "${details.to || 'N/A'}"`;
      case "notes_updated":
        return `Admin notes ${details.previous ? 'updated' : 'added'}`;
      case "reviewed":
        return `Candidate reviewed and marked as ${details.status}`;
      case "shortlist_toggle":
        return `Candidate ${details.shortlisted ? 'added to' : 'removed from'} shortlist`;
      default:
        return event.action.replace(/_/g, ' ');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {events.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-3 relative">
                  {index !== events.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex-shrink-0 mt-1 relative z-10 bg-background">
                    {getEventIcon(event.action)}
                  </div>
                  <div className="flex-1 space-y-1 pb-4">
                    <div className="text-sm font-medium">
                      {getEventDescription(event)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </div>
                    {event.details?.notes && (
                      <div className="text-xs bg-muted p-2 rounded mt-2">
                        {event.details.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
