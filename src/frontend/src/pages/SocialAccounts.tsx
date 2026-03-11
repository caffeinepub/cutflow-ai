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
import { useAddSocialAccount, useGetSocialAccounts } from "@/hooks/useQueries";
import { CheckCircle2, Link2, Loader2, Unlink } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiInstagram, SiTiktok, SiX, SiYoutube } from "react-icons/si";
import { toast } from "sonner";

const PLATFORMS = [
  {
    id: "youtube",
    label: "YouTube",
    Icon: SiYoutube,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description: "Upload and manage videos",
  },
  {
    id: "tiktok",
    label: "TikTok",
    Icon: SiTiktok,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    description: "Post short-form videos",
  },
  {
    id: "instagram",
    label: "Instagram",
    Icon: SiInstagram,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    description: "Share reels and stories",
  },
  {
    id: "twitter",
    label: "Twitter/X",
    Icon: SiX,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    description: "Post video tweets",
  },
];

export default function SocialAccounts() {
  const { data: accounts = [] } = useGetSocialAccounts();
  const addAccount = useAddSocialAccount();

  const [connectPlatform, setConnectPlatform] = useState<string | null>(null);
  const [handle, setHandle] = useState("");

  const sampleAccounts = [{ platform: "youtube", accountHandle: "@mychannel" }];
  const displayAccounts = accounts.length > 0 ? accounts : sampleAccounts;

  function getLinked(platformId: string) {
    return displayAccounts.find((a) => a.platform.toLowerCase() === platformId);
  }

  async function handleConnect() {
    if (!connectPlatform || !handle.trim()) return;
    try {
      await addAccount.mutateAsync({
        platform: connectPlatform,
        accountHandle: handle,
      });
      toast.success(`${connectPlatform} account connected!`);
      setConnectPlatform(null);
      setHandle("");
    } catch {
      toast.error("Failed to connect account");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Social Accounts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect your platforms for automated publishing
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
          hidden: {},
        }}
      >
        {PLATFORMS.map((platform, i) => {
          const linked = getLinked(platform.id);
          const { Icon } = platform;
          return (
            <motion.div
              key={platform.id}
              data-ocid={`social.item.${i + 1}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className={`rounded-xl border p-5 ${platform.border} bg-card flex items-center gap-4`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${platform.bg} flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-6 h-6 ${platform.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{platform.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {linked ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-3 h-3" /> Connected as{" "}
                      {linked.accountHandle}
                    </span>
                  ) : (
                    platform.description
                  )}
                </p>
              </div>
              {linked ? (
                <Button
                  data-ocid={`social.item.${i + 1}.delete_button`}
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs text-destructive border-destructive/30 hover:border-destructive/60"
                  onClick={() =>
                    toast.success(`${platform.label} disconnected`)
                  }
                >
                  <Unlink className="w-3 h-3 mr-1" /> Disconnect
                </Button>
              ) : (
                <Button
                  data-ocid={`social.item.${i + 1}.primary_button`}
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => {
                    setConnectPlatform(platform.id);
                    setHandle("");
                  }}
                >
                  <Link2 className="w-3 h-3 mr-1" /> Connect
                </Button>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <Dialog
        open={!!connectPlatform}
        onOpenChange={(o) => !o && setConnectPlatform(null)}
      >
        <DialogContent data-ocid="social.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display capitalize">
              Connect {connectPlatform}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Account Handle</Label>
              <Input
                data-ocid="social.input"
                placeholder="@yourhandle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="social.cancel_button"
              variant="outline"
              onClick={() => setConnectPlatform(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="social.submit_button"
              onClick={handleConnect}
              disabled={addAccount.isPending || !handle.trim()}
            >
              {addAccount.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
