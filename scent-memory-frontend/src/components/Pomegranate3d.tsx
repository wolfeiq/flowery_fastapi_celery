'use client';

export default function RotatingCube() {
  return (
    <div className="cube-container">
      <div className="cube">
        <div className="face front" />
        <div className="face back" />
        <div className="face right" />
        <div className="face left" />
        <div className="face top" />
        <div className="face bottom" />
      </div>

      <style jsx>{`
        .cube-container {
          width: 200px;
          height: 200px;
          perspective: 800px;
          margin: 0 auto;
        }

        .cube {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotate 8s infinite linear;
        }

        .face {
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          opacity: 0.8;
          border: 2px solid rgba(200, 145, 147, 0.6);
          box-shadow: 
            0 0 50px rgba(200, 145, 147, 0.4),
            inset 0 0 30px rgba(200, 145, 147, 0.2);
        }

        .front {
          transform: translateZ(100px);
        }

        .back {
          transform: rotateY(180deg) translateZ(100px);
        }

        .right {
          transform: rotateY(90deg) translateZ(100px);
        }

        .left {
          transform: rotateY(-90deg) translateZ(100px);
        }

        .top {
          transform: rotateX(90deg) translateZ(100px);
        }

        .bottom {
          transform: rotateX(-90deg) translateZ(100px);
        }

        .cube-container:hover .cube {
          animation-play-state: paused;
        }

        @keyframes rotate {
          0% {
            transform: rotateX(0) rotateY(0) rotateZ(0);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }
      `}</style>
    </div>
  );
}