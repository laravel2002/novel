"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { LibraryDesktop, type LibraryViewProps } from "./LibraryDesktop";
import { LibraryMobile } from "./LibraryMobile";

export function LibraryListUI(props: Partial<LibraryViewProps> & { userId: string }) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <LibraryMobile 
      readingHistory={props.readingHistory || []} 
      bookmarks={props.bookmarks || []} 
      waitlist={props.waitlist || []} 
      completed={props.completed || []} 
      {...props} 
    />;
  }

  return <LibraryDesktop 
    readingHistory={props.readingHistory || []} 
    bookmarks={props.bookmarks || []} 
    waitlist={props.waitlist || []} 
    completed={props.completed || []} 
    {...props} 
  />;
}
