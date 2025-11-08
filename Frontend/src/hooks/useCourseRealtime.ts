/* eslint-disable */
import { useEffect } from "react";
import { socket } from "../lib/socket";

export function useCourseRealtime(
  courseId: string,
  handlers: {
    onFaqCreated?: (faq: any) => void;
    onFaqAnswered?: (faq: any) => void;
    onReviewCreated?: (review: any) => void;
  }
) {
  useEffect(() => {
    if (!courseId) return;
    socket.emit("joinCourse", courseId);

    if (handlers.onFaqCreated) socket.on("faq:created", handlers.onFaqCreated);
    if (handlers.onFaqAnswered)
      socket.on("faq:answered", handlers.onFaqAnswered);
    if (handlers.onReviewCreated)
      socket.on("review:created", handlers.onReviewCreated);

    return () => {
      if (handlers.onFaqCreated)
        socket.off("faq:created", handlers.onFaqCreated);
      if (handlers.onFaqAnswered)
        socket.off("faq:answered", handlers.onFaqAnswered);
      if (handlers.onReviewCreated)
        socket.off("review:created", handlers.onReviewCreated);
    };
  }, [courseId]);
}
