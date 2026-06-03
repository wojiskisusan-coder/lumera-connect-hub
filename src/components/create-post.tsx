import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Image as ImageIcon, PenSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function CreatePost() {
  const { profile } = useAuth();
  return (
    <Link to="/create" className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={profile?.avatar_url ?? undefined} />
        <AvatarFallback>{profile?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground">
        What's on your mind?
      </div>
      <ImageIcon className="h-5 w-5 text-primary" />
      <PenSquare className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}