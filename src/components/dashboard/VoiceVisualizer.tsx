import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isRecording: boolean;
  stream?: MediaStream;
}

export default function VoiceVisualizer({ isRecording, stream }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyzerRef.current = null;
      dataArrayRef.current = null;
      
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      return;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyzer.fftSize = 2048;
    analyzer.smoothingTimeConstant = 0.8;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyzer);
    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const draw = () => {
      if (!analyzerRef.current || !dataArrayRef.current || !ctx) {
        return;
      }

      animationRef.current = requestAnimationFrame(draw);

      analyzerRef.current.getByteTimeDomainData(dataArrayRef.current);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'hsl(210, 100%, 50%)');
      gradient.addColorStop(0.5, 'hsl(180, 100%, 50%)');
      gradient.addColorStop(1, 'hsl(210, 100%, 50%)');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={128}
        className="w-full h-full"
      />
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </div>
      )}
    </div>
  );
}