
'use client';

import { motion } from 'framer-motion';

const svgVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.3 
    }
  },
};

const pathVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

const innerCircleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: 'backOut'
        }
    }
}


export default function LandingPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.svg
            width="100"
            height="100"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            variants={svgVariants}
            initial="hidden"
            animate="visible"
            >
            <title>Oriango Logo Loader</title>
            <motion.path
                d="M32 59C46.9117 59 59 46.9117 59 32C59 17.0883 46.9117 5 32 5C17.0883 5 5 17.0883 5 32C5 46.9117 17.0883 59 32 59Z"
                className="fill-none stroke-primary"
                strokeWidth="5"
                variants={pathVariants}
            />
            <motion.path
                d="M32 49C41.3888 49 49 41.3888 49 32C49 22.6112 41.3888 15 32 15C22.6112 15 15 22.6112 15 32C15 41.3888 22.6112 49 32 49Z"
                className="fill-background"
                variants={innerCircleVariants}
            />
        </motion.svg>
    </div>
  );
}

