
'use client';

import { motion } from 'framer-motion';
import { OriangoLogo } from './oriango-logo';

export default function LandingPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <OriangoLogo className="h-20 w-20 text-primary" />
      </motion.div>
    </div>
  );
}
