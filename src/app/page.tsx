import { ActivityRefinerForm } from "@/components/ActivityRefinerForm"

export default function Home() {
  return (
    <main className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ActivityRefinerForm />
      </div>

      <footer className="text-center text-sm text-muted-foreground p-3 border-t">
        <p>This tool is designed to help you format activities for college applications. Always review the specific requirements of each application.</p>
      </footer>
    </main>
  )
}
