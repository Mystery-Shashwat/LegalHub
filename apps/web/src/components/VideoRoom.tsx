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
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || callObject) return;

    const newCallObject = DailyIframe.createFrame(containerRef.current, {
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

    setCallObject(newCallObject);

    return () => {
      newCallObject.destroy();
    };
  }, [callObject]);

  const joinCall = useCallback(async () => {
    if (!callObject || !url) return;
    setIsJoining(true);
    setError(null);

    try {
      await callObject.join({
        url,
        videoSource: videoEnabled,
        audioSource: audioEnabled,
      });
      setIsJoined(true);
    } catch (e) {
      console.error("Failed to join call", e);
      setError("Failed to join the video session. Please check your camera/microphone permissions.");
    } finally {
      setIsJoining(false);
    }
  }, [callObject, url, videoEnabled, audioEnabled]);

  const leaveCall = useCallback(async () => {
    if (!callObject) return;
    await callObject.leave();
    setIsJoined(false);
    onLeave();
  }, [callObject, onLeave]);

  useEffect(() => {
    if (!callObject) return;

    callObject.on("joined-meeting", () => setIsJoined(true));
    callObject.on("left-meeting", () => leaveCall());
    callObject.on("error", (e) => {
      console.error("Daily error:", e);
      setError("A video error occurred.");
    });

    return () => {
      callObject.off("joined-meeting", () => setIsJoined(true));
      callObject.off("left-meeting", () => leaveCall());
      callObject.off("error", () => setError("A video error occurred."));
    };
  }, [callObject, leaveCall]);


  const toggleAudio = () => {
    if (!callObject) return;
    const newAudioLocal = !audioEnabled;
    callObject.setLocalAudio(newAudioLocal);
    setAudioEnabled(newAudioLocal);
  };

  const toggleVideo = () => {
    if (!callObject) return;
    const newVideoLocal = !videoEnabled;
    callObject.setLocalVideo(newVideoLocal);
    setVideoEnabled(newVideoLocal);
  };

  return (
    <div className="w-full flex justify-center bg-muted/20 border rounded-xl overflow-hidden relative" style={{ height: "60vh", minHeight: "500px" }}>
      
      {/* The Daily.co iframe gets injected here */}
      <div 
        ref={containerRef} 
        className={`w-full h-full transition-opacity duration-300 ${!isJoined ? 'opacity-0 absolute inset-0 -z-10' : 'opacity-100 z-10'}`} 
      />

      {/* Lobby / Pre-join screen */}
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
                    <p className="text-muted-foreground">Setup your camera and microphone before joining.</p>
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <Button 
                    variant={videoEnabled ? "outline" : "destructive"} 
                    size="lg" 
                    className="h-16 w-16 rounded-full"
                    onClick={toggleVideo}
                >
                    {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <Button 
                    variant={audioEnabled ? "outline" : "destructive"} 
                    size="lg" 
                    className="h-16 w-16 rounded-full"
                    onClick={toggleAudio}
                >
                    {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
                <Button variant="outline" className="flex-1" onClick={onLeave} disabled={isJoining}>
                    Cancel
                </Button>
                <Button className="flex-1" onClick={joinCall} disabled={isJoining}>
                    {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Session
                </Button>
            </div>
         </div>
      )}
    </div>
  );
}
