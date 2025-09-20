
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const announcements = [
  {
    text: "Welcome to Oriango! Financial empowerment, made simple for you.",
    link: "/about",
    linkLabel: "Learn More"
  },
  {
    text: "Get funded in three simple steps: Apply, Get Approved, Receive Funds.",
    link: "/#how-it-works",
    linkLabel: "How It Works"
  },
  {
    text: "Use our AI-powered calculator to check your loan eligibility instantly.",
    link: "/#calculator",
    linkLabel: "Try It Now"
  },
  {
    text: "Ready to get started? Create an account to begin your financial journey.",
    link: "/signup",
    linkLabel: "Sign Up"
  }
];

export default function AnnouncementBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcementDismissed');
    if (dismissed !== 'true') {
      setIsDismissed(false);
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('announcementDismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  const { text, link, linkLabel } = announcements[currentIndex];

  return (
    <div className={cn(
        "relative bg-gradient-to-r from-primary to-accent text-primary-foreground backdrop-blur-sm transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center">
            <Megaphone className="h-5 w-5 mr-3 animate-pulse" />
            <p className="text-sm font-medium">
              {text}
              {link && (
                <Link href={link} className="ml-2 inline-flex items-center font-bold underline hover:no-underline">
                  {linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-white/20"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
