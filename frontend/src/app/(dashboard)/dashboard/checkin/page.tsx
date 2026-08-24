import { permanentRedirect } from "next/navigation"

export default function CheckinRedirectPage() {
  permanentRedirect("/dashboard/acreditacion")
}
