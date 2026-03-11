import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetProject } from "@/hooks/useQueries";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Mic,
  Pause,
  Play,
  Scissors,
  Send,
  Sliders,
  Sparkles,
  Type,
  Volume2,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const PRESETS = [
  { value: "youtube", label: "YouTube 16:9", ratio: "16/9" },
  { value: "tiktok", label: "TikTok 9:16", ratio: "9/16" },
  { value: "instagram", label: "Instagram 1:1", ratio: "1/1" },
  { value: "twitter", label: "Twitter 16:9", ratio: "16/9" },
];

const FILTERS = [
  { name: "Cinematic", css: "contrast(1.1) saturate(0.85) brightness(0.95)" },
  { name: "Vivid", css: "saturate(1.5) contrast(1.05)" },
  { name: "Matte", css: "contrast(0.9) saturate(0.8) brightness(1.05)" },
  { name: "B&W", css: "grayscale(1) contrast(1.1)" },
  { name: "Warm", css: "sepia(0.3) saturate(1.2) brightness(1.05)" },
  { name: "Cool", css: "hue-rotate(15deg) saturate(0.9)" },
  { name: "Fade", css: "opacity(0.9) brightness(1.1) saturate(0.7)" },
  { name: "Sharp", css: "contrast(1.3) saturate(1.1)" },
];

const AI_TOOLS = [
  { icon: Type, label: "AI Captions", desc: "Auto-generate captions" },
  { icon: Scissors, label: "Smart Cuts", desc: "Detect best cut points" },
  { icon: Wand2, label: "Auto-Enhance", desc: "Color & exposure fix" },
  { icon: Mic, label: "Remove BG", desc: "Isolate voice audio" },
];

const CLIPS = [
  { id: 1, track: "video", start: 0, width: 200, label: "Intro.mp4" },
  { id: 2, track: "video", start: 210, width: 150, label: "Main.mp4" },
  { id: 3, track: "video", start: 370, width: 180, label: "Outro.mp4" },
  { id: 4, track: "audio", start: 0, width: 420, label: "BG Music" },
  { id: 5, track: "audio", start: 20, width: 200, label: "Voiceover" },
  { id: 6, track: "caption", start: 30, width: 100, label: "Caption 1" },
  { id: 7, track: "caption", start: 150, width: 120, label: "Caption 2" },
  { id: 8, track: "caption", start: 300, width: 90, label: "Caption 3" },
];

export default function Editor() {
  const { id } = useParams({ from: "/editor/$id" });
  const navigate = useNavigate();
  const { data: project } = useGetProject(BigInt(id));

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [title, setTitle] = useState(project?.title ?? "Untitled Project");
  const [preset, setPreset] = useState(project?.platform ?? "youtube");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [volume, setVolume] = useState([75]);
  const [musicVol, setMusicVol] = useState([60]);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  function togglePlay() {
    if (playing) {
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      progressInterval.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            if (progressInterval.current)
              clearInterval(progressInterval.current);
            setPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    }
    setPlaying((p) => !p);
  }

  function handleAiTool(label: string) {
    toast.success(`${label}: AI feature processing...`, {
      description: "This may take a few moments",
    });
  }

  const presetObj = PRESETS.find((p) => p.value === preset) ?? PRESETS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/50 shrink-0">
        <Button
          data-ocid="editor.secondary_button"
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="w-px h-5 bg-border" />
        <Input
          data-ocid="editor.input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 w-48 font-medium bg-transparent border-transparent hover:border-border focus:border-primary text-sm"
        />
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger data-ocid="editor.select" className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button
            data-ocid="editor.secondary_button"
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button
            data-ocid="editor.primary_button"
            size="sm"
            className="glow-primary"
          >
            <Send className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: AI Tools */}
        <div className="w-52 shrink-0 border-r border-border bg-card/30 p-3 flex flex-col gap-2 overflow-y-auto scrollbar-thin">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            AI Tools
          </p>
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                type="button"
                key={tool.label}
                data-ocid={`editor.${tool.label.toLowerCase().replace(/\s+/g, "-")}.button`}
                onClick={() => handleAiTool(tool.label)}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </button>
            );
          })}
          <div className="mt-auto pt-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  AI Credits
                </span>
              </div>
              <div className="text-xs text-muted-foreground">47 / 100 used</div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[47%] bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
          <div
            data-ocid="editor.canvas_target"
            className="relative rounded-xl overflow-hidden border border-border bg-black shadow-2xl"
            style={{
              aspectRatio: presetObj.ratio,
              maxHeight: "calc(100% - 80px)",
              maxWidth: "100%",
              filter: selectedFilter
                ? FILTERS.find((f) => f.name === selectedFilter)?.css
                : undefined,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              <div className="text-center">
                <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground/50 text-sm">
                  Video Preview
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {presetObj.label}
                </Badge>
              </div>
            </div>
            {textOverlay && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <div className="bg-black/70 px-4 py-2 rounded text-white text-sm font-medium">
                  {textOverlay}
                </div>
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3 mt-4 w-full max-w-md">
            <button
              type="button"
              data-ocid="editor.toggle"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
            >
              {playing ? (
                <Pause className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
              )}
            </button>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden cursor-pointer">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ type: "tween" }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {String(Math.floor((progress / 100) * 2)).padStart(2, "0")}:
              {String(Math.floor(((progress / 100) * 120) % 60)).padStart(
                2,
                "0",
              )}
            </span>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="w-56 shrink-0 border-l border-border bg-card/30 overflow-y-auto scrollbar-thin">
          <Tabs defaultValue="effects" className="h-full">
            <TabsList
              data-ocid="editor.tab"
              className="w-full rounded-none border-b border-border bg-transparent px-2 pt-2 h-auto pb-0 justify-start gap-1"
            >
              <TabsTrigger
                value="effects"
                className="text-xs px-2 py-1.5 data-[state=active]:bg-muted"
              >
                Effects
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="text-xs px-2 py-1.5 data-[state=active]:bg-muted"
              >
                Text
              </TabsTrigger>
              <TabsTrigger
                value="audio"
                className="text-xs px-2 py-1.5 data-[state=active]:bg-muted"
              >
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="effects" className="p-3 m-0">
              <p className="text-xs text-muted-foreground mb-3">
                Select a filter
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.map((f) => (
                  <button
                    type="button"
                    key={f.name}
                    data-ocid={`editor.${f.name.toLowerCase()}.toggle`}
                    onClick={() =>
                      setSelectedFilter(
                        selectedFilter === f.name ? null : f.name,
                      )
                    }
                    className={`rounded-lg border p-2 text-center text-xs transition-all ${
                      selectedFilter === f.name
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div
                      className="w-full aspect-video rounded mb-1 bg-gradient-to-br from-slate-700 to-slate-600"
                      style={{ filter: f.css }}
                    />
                    {f.name}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="text" className="p-3 m-0 flex flex-col gap-3">
              <Label className="text-xs">Text Overlay</Label>
              <Input
                data-ocid="editor.textarea"
                placeholder="Enter text..."
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                className="text-xs"
              />
              <Button
                data-ocid="editor.save_button"
                size="sm"
                className="text-xs"
              >
                <Type className="w-3 h-3 mr-1" /> Add Text
              </Button>
            </TabsContent>

            <TabsContent value="audio" className="p-3 m-0 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Voice Volume
                </Label>
                <Slider
                  data-ocid="editor.toggle"
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                />
                <span className="text-xs text-muted-foreground text-right">
                  {volume[0]}%
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs flex items-center gap-1">
                  <Sliders className="w-3 h-3" /> Music Volume
                </Label>
                <Slider
                  data-ocid="editor.toggle"
                  value={musicVol}
                  onValueChange={setMusicVol}
                  max={100}
                  step={1}
                />
                <span className="text-xs text-muted-foreground text-right">
                  {musicVol[0]}%
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom: Timeline */}
      <div className="h-44 shrink-0 border-t border-border bg-card/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Timeline
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
              <ChevronDown className="w-3 h-3 mr-1" /> Zoom
            </Button>
          </div>
        </div>
        <div
          data-ocid="editor.editor"
          className="overflow-x-auto scrollbar-thin px-4 py-2"
        >
          {["video", "audio", "caption"].map((trackType) => (
            <div key={trackType} className="flex items-center mb-2 gap-2">
              <div className="w-16 shrink-0 text-xs text-muted-foreground capitalize font-mono">
                {trackType}
              </div>
              <div className="relative h-9 flex-1 timeline-track rounded overflow-hidden">
                {CLIPS.filter((c) => c.track === trackType).map((clip) => (
                  <div
                    key={clip.id}
                    data-ocid={`editor.${trackType}.item.${clip.id}`}
                    className={`absolute top-0 h-full rounded flex items-center px-2 text-xs font-medium text-white/90 cursor-pointer hover:brightness-110 transition-all clip-${trackType}`}
                    style={{ left: clip.start, width: clip.width }}
                  >
                    <span className="truncate">{clip.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Film({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <title>Film icon</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  );
}
