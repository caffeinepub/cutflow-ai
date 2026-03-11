import type { ScheduledPost } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAllProjects,
  useGetAllScheduledPosts,
  useSchedulePost,
  useUpdatePostStatus,
} from "@/hooks/useQueries";
import { Clock, Loader2, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = ["youtube", "tiktok", "instagram", "twitter"];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
    published: "border-green-500/40 text-green-400 bg-green-500/10",
    cancelled: "border-muted-foreground/30 text-muted-foreground bg-muted/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${map[status] ?? map.pending}`}
    >
      {status}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    youtube: "bg-red-600",
    tiktok: "bg-pink-500",
    instagram: "bg-purple-500",
    twitter: "bg-sky-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${colors[platform.toLowerCase()] ?? "bg-muted"}`}
    >
      {platform}
    </span>
  );
}

const SAMPLE_POSTS: ScheduledPost[] = [
  {
    title: "Summer Launch",
    description: "Product reveal",
    platform: "youtube",
    projectId: 1n,
    scheduledTime: BigInt(new Date("2026-03-15T10:00:00").getTime()) * 1000000n,
    status: "pending",
  },
  {
    title: "Behind the Scenes",
    description: "BTS reel",
    platform: "instagram",
    projectId: 2n,
    scheduledTime: BigInt(new Date("2026-03-16T14:30:00").getTime()) * 1000000n,
    status: "published",
  },
  {
    title: "Tutorial Clip",
    description: "Color grading",
    platform: "tiktok",
    projectId: 3n,
    scheduledTime: BigInt(new Date("2026-03-17T09:00:00").getTime()) * 1000000n,
    status: "pending",
  },
  {
    title: "Brand Story",
    description: "Annual brand",
    platform: "twitter",
    projectId: 4n,
    scheduledTime: BigInt(new Date("2026-03-20T12:00:00").getTime()) * 1000000n,
    status: "cancelled",
  },
];

export default function AutomationQueue() {
  const { data: posts = [], isLoading } = useGetAllScheduledPosts();
  const { data: projects = [] } = useGetAllProjects();
  const schedulePost = useSchedulePost();
  const updateStatus = useUpdatePostStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    projectId: "",
    platform: "youtube",
    scheduledTime: "",
    title: "",
    description: "",
  });

  const displayPosts = posts.length > 0 ? posts : SAMPLE_POSTS;

  async function handleSchedule() {
    if (!form.title.trim() || !form.scheduledTime) return;
    try {
      const ts = BigInt(new Date(form.scheduledTime).getTime()) * 1000000n;
      const projectId = form.projectId ? BigInt(form.projectId) : 1n;
      await schedulePost.mutateAsync({
        projectId,
        platform: form.platform,
        scheduledTime: ts,
        title: form.title,
        description: form.description,
      });
      toast.success("Post scheduled!");
      setDialogOpen(false);
      setForm({
        projectId: "",
        platform: "youtube",
        scheduledTime: "",
        title: "",
        description: "",
      });
    } catch {
      toast.error("Failed to schedule post");
    }
  }

  async function handleCancel(post: ScheduledPost, index: number) {
    try {
      await updateStatus.mutateAsync({
        projectId: post.projectId,
        postIndex: BigInt(index),
        newStatus: "cancelled",
      });
      toast.success("Post cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  }

  function formatTime(ts: bigint) {
    return new Date(Number(ts / 1000000n)).toLocaleString();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Automation Queue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Schedule posts across all connected platforms
          </p>
        </div>
        <Button
          data-ocid="automation.primary_button"
          onClick={() => setDialogOpen(true)}
          className="glow-primary"
        >
          <Plus className="w-4 h-4 mr-2" /> Schedule Post
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="automation.loading_state"
          className="flex justify-center py-24"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border overflow-hidden"
        >
          {displayPosts.length === 0 ? (
            <div
              data-ocid="automation.empty_state"
              className="py-24 flex flex-col items-center gap-4"
            >
              <Clock className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">No scheduled posts yet</p>
              <Button
                data-ocid="automation.empty_state.primary_button"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Schedule Post
              </Button>
            </div>
          ) : (
            <Table data-ocid="automation.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">
                    Title
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Platform
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Scheduled
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs text-muted-foreground w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPosts.map((post, i) => (
                  <TableRow
                    key={`${post.title}-${post.platform}-${i}`}
                    data-ocid={`automation.row.${i + 1}`}
                    className="border-border hover:bg-muted/20"
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{post.title}</p>
                        {post.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlatformBadge platform={post.platform} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatTime(post.scheduledTime)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell>
                      {post.status === "pending" && (
                        <Button
                          data-ocid={`automation.row.${i + 1}.delete_button`}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleCancel(post, i)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="automation.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {projects.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Project</Label>
                <Select
                  value={form.projectId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, projectId: v }))
                  }
                >
                  <SelectTrigger data-ocid="automation.select">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id.toString()} value={p.id.toString()}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input
                data-ocid="automation.input"
                placeholder="Post title"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}
              >
                <SelectTrigger data-ocid="automation.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((pl) => (
                    <SelectItem key={pl} value={pl} className="capitalize">
                      {pl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Scheduled Time</Label>
              <Input
                data-ocid="automation.input"
                type="datetime-local"
                value={form.scheduledTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledTime: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea
                data-ocid="automation.textarea"
                placeholder="Optional description..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="automation.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="automation.submit_button"
              onClick={handleSchedule}
              disabled={
                schedulePost.isPending ||
                !form.title.trim() ||
                !form.scheduledTime
              }
            >
              {schedulePost.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
