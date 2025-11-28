import ComentariosClient from "@/components/comentarios-client";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ComentariosClient />
    </Suspense>
  );
}
