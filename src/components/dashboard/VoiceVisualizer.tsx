import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isRecording: boolean;
  stream?: MediaStream;
}

export default function VoiceVisualizer({ isRecording, stream }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();

  useEffect(() => {
    if (!stream || !isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyzer);
    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isRecording || !analyzerRef.current || !dataArrayRef.current) {
        return;
      }

      animationRef.current = requestAnimationFrame(draw);

      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(210, 100%, 60%)');
        gradient.addColorStop(1, 'hsl(210, 100%, 40%)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, stream]);

  return (
    <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={128}
        className="w-full h-full"
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Нажмите на микрофон для начала записи
        </div>
      )}
    </div>
  );
}
