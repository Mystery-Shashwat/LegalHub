"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Button } from "./ui/button";
import { Video, VideoOff, MicOff, Mic, Loader2 } from "lucide-react";

interface VideoRoomProps {
  url: string;
  onLeave: () => void;
}

export function VideoRoom({ url, onLeave }: VideoRoomProps) {
  const callRef = useRef<DailyCall | null>(null);
  const onLeaveRef = useRef(onLeave);
  useEffect(() => { onLeaveRef.current = onLeave; }, [onLeave]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Defer frame creation by one tick — this ensures any prior async destroy()
    // from React Strict Mode's cleanup has fully cleared Daily's internal registry
    // before we try to create a new frame.
    const timer = setTimeout(() => {
      if (!containerRef.current || callRef.current) return;

      const call = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "12px",
          backgroundColor: "#000",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      callRef.current = call;

      const onJoined = () => setIsJoined(true);
      const onLeft = () => { setIsJoined(false); onLeaveRef.current(); };
      const onError = (e: unknown) => {
        console.error("Daily error:", e);
        setError("A video error occurred.");
      };

      call.on("joined-meeting", onJoined);
      call.on("left-meeting", onLeft);
      call.on("error", onError);
    }, 0);

    return () => {
      clearTimeout(timer); // if cleanup fires before timer, cancel creation
      if (callRef.current) {
        callRef.current.destroy();
        callRef.current = null;
      }
    };
  }, []); // runs once on mount

  const joinCall = useCallback(async () => {
    if (!callRef.current || !url) return;
    setIsJoining(true);
    setError(null);
    try {
      await callRef.current.join({
        url,
        videoSource: videoEnabled,
        audioSource: audioEnabled,
      });
      setIsJoined(true);
    } catch (e) {
      console.error("Failed to join call", e);
      setError("Failed to join the session. Check your camera/microphone permissions.");
    } finally {
      setIsJoining(false);
    }
  }, [url, videoEnabled, audioEnabled]);

  const leaveCall = useCallback(async () => {
    if (!callRef.current) return;
    await callRef.current.leave();
    setIsJoined(false);
    onLeaveRef.current();
  }, []);

  const toggleAudio = () => {
    if (!callRef.current) return;
    const next = !audioEnabled;
    callRef.current.setLocalAudio(next);
    setAudioEnabled(next);
  };

  const toggleVideo = () => {
    if (!callRef.current) return;
    const next = !videoEnabled;
    callRef.current.setLocalVideo(next);
    setVideoEnabled(next);
  };

  return (
    <div className="w-full flex justify-center bg-muted/20 border rounded-xl overflow-hidden relative" style={{ height: "60vh", minHeight: "500px" }}>
      {/* Daily.co iframe is injected here */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-300 ${!isJoined ? "opacity-0 absolute inset-0 -z-10" : "opacity-100 z-10"}`}
      />

      {/* Pre-join lobby */}
      {!isJoined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-20 p-6 text-center">
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 max-w-md">
              <p className="font-semibold">Error joining session</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Ready to join your consultation?</h2>
              <p className="text-muted-foreground">Set up your camera and microphone before joining.</p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <Button variant={videoEnabled ? "outline" : "destructive"} size="lg" className="h-16 w-16 rounded-full" onClick={toggleVideo}>
              {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            <Button variant={audioEnabled ? "outline" : "destructive"} size="lg" className="h-16 w-16 rounded-full" onClick={toggleAudio}>
              {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <Button variant="outline" className="flex-1" onClick={onLeave} disabled={isJoining}>Cancel</Button>
            <Button className="flex-1" onClick={joinCall} disabled={isJoining}>
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Session
            </Button>
          </div>
        </div>
      )}

      {/* In-call controls */}
      {isJoined && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          <Button variant={audioEnabled ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12" onClick={toggleAudio}>
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button variant={videoEnabled ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button variant="destructive" size="icon" className="rounded-full h-12 w-12" onClick={leaveCall}>✕</Button>
        </div>
      )}
    </div>
  );
}
