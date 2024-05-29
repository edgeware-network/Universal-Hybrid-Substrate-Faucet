import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  };

  const options: ISourceOptions = useMemo(() => {
    return {
      background: {
        color: "#131313",
      },
      fullScreen: {
        enable: true,
        zIndex: 0,
      },
      interactivity: {
        events: {
          onClick: {
            enable: false,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 15,
          },
          repulse: {
            distance: 150,
          },
        },
      },
      particles: {
        shape:{
          type: "image",
          options: {
            image: [
              {
                src: "/images/beresheet.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/rococo.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/tangle.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/westend.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/moonbase-alpha.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/rococo-assethub.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/nodle.svg",
                width: 100,
                height: 100,
              },
              {
                src: "/images/bifrost.svg",
                width: 100,
                height: 100,
              },
            ]
          }
        },
        links: {
          enable: true,
          distance: 100,
          color: "#808080",
        },
        move: {
          enable: true,
          speed: { min: 0.5, max: 1 },
        },
        opacity: {
          value: { min: 0.3, max: 0.7 },
        },
        number: {
          value: 120,
          density: {
            enable: true,
            value_area: 700,
          },
        },
        size: {
          value: { min: 12, max: 14 },
        },
      },
    };
  }, []);

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        style={{
          zIndex: -10,
        }}
      />
    );
  }

  return <></>;
};

export default ParticlesComponent;
