import type { VideoProject } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProject,
  useDeleteProject,
  useGetAllProjects,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  Edit2,
  ExternalLink,
  Film,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "youtube", label: "YouTube", color: "bg-red-600" },
  { value: "tiktok", label: "TikTok", color: "bg-pink-500" },
  { value: "instagram", label: "Instagram", color: "bg-purple-500" },
  { value: "twitter", label: "Twitter/X", color: "bg-sky-500" },
];

function PlatformBadge({ platform }: { platform: string }) {
  const p = PLATFORMS.find((x) => x.value === platform.toLowerCase());
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${p?.color ?? "bg-muted"}`}
    >
      {p?.label ?? platform}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "border-muted-foreground/40 text-muted-foreground",
    published: "border-green-500/40 text-green-400",
    processing: "border-yellow-500/40 text-yellow-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${map[status] ?? map.draft}`}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useGetAllProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "youtube",
  });

  async function handleCreate() {
    if (!form.title.trim()) return;
    try {
      const id = await createProject.mutateAsync(form);
      toast.success("Project created");
      setCreateOpen(false);
      setForm({ title: "", description: "", platform: "youtube" });
      navigate({ to: "/editor/$id", params: { id: id.toString() } });
    } catch {
      toast.error("Failed to create project");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteProject.mutateAsync(deleteId);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleteId(null);
    }
  }

  const sampleProjects: VideoProject[] = [
    {
      id: 1n,
      title: "Summer Product Launch",
      description: "Q3 product reveal for social channels",
      platform: "youtube",
      status: "draft",
      owner: "" as any,
      createdAt: BigInt(Date.now() - 86400000) * 1000000n,
    },
    {
      id: 2n,
      title: "Behind the Scenes Reel",
      description: "Studio footage from last month's shoot",
      platform: "instagram",
      status: "processing",
      owner: "" as any,
      createdAt: BigInt(Date.now() - 172800000) * 1000000n,
    },
    {
      id: 3n,
      title: "Tutorial: Color Grading",
      description: "Step-by-step guide for beginners",
      platform: "tiktok",
      status: "published",
      owner: "" as any,
      createdAt: BigInt(Date.now() - 259200000) * 1000000n,
    },
    {
      id: 4n,
      title: "Brand Story 2026",
      description: "Annual brand identity video",
      platform: "twitter",
      status: "draft",
      owner: "" as any,
      createdAt: BigInt(Date.now() - 345600000) * 1000000n,
    },
  ];

  const displayProjects = projects.length > 0 ? projects : sampleProjects;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your video projects
          </p>
        </div>
        <Button
          data-ocid="dashboard.primary_button"
          onClick={() => setCreateOpen(true)}
          className="glow-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="dashboard.loading_state"
          className="flex items-center justify-center py-24"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : displayProjects.length === 0 ? (
        <motion.div
          data-ocid="dashboard.empty_state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-border rounded-xl flex flex-col items-center justify-center py-24 gap-4"
        >
          <FolderOpen className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No projects yet. Create your first one!
          </p>
          <Button
            data-ocid="dashboard.empty_state.primary_button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
            hidden: {},
          }}
        >
          <AnimatePresence>
            {displayProjects.map((project, i) => (
              <motion.div
                key={project.id.toString()}
                data-ocid={`dashboard.item.${i + 1}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors group"
              >
                <div className="aspect-video rounded-lg bg-muted/30 flex items-center justify-center border border-border overflow-hidden">
                  <Film className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PlatformBadge platform={project.platform} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    data-ocid={`dashboard.item.${i + 1}.primary_button`}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() =>
                      navigate({
                        to: "/editor/$id",
                        params: { id: project.id.toString() },
                      })
                    }
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> Open Editor
                  </Button>
                  <Button
                    data-ocid={`dashboard.item.${i + 1}.edit_button`}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/editor/$id",
                        params: { id: project.id.toString() },
                      })
                    }
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    data-ocid={`dashboard.item.${i + 1}.delete_button`}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:border-destructive/50"
                    onClick={() => setDeleteId(project.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-ocid="dashboard.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">New Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-title">Title</Label>
              <Input
                id="proj-title"
                data-ocid="dashboard.input"
                placeholder="My Awesome Video"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-desc">Description</Label>
              <Textarea
                id="proj-desc"
                data-ocid="dashboard.textarea"
                placeholder="What is this video about?"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Platform Preset</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}
              >
                <SelectTrigger data-ocid="dashboard.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="dashboard.cancel_button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="dashboard.submit_button"
              onClick={handleCreate}
              disabled={createProject.isPending || !form.title.trim()}
            >
              {createProject.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="dashboard.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="dashboard.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="dashboard.delete_button"
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProject.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
