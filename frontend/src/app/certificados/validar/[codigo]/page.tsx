"use client"

import { useParams } from "next/navigation"
import { PublicCertificateValidator } from "@/components/certificates/public-certificate-validator"

export default function ValidarCertificadoCodigoPage() {
  const params = useParams<{ codigo: string }>()

  return (
    <main className="min-h-dvh bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <PublicCertificateValidator initialCode={params.codigo} />
      </div>
    </main>
  )
}
