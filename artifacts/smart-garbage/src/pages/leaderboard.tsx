import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Leaf, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() }
  });

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="w-7 h-7 text-yellow-500 fill-yellow-500/20" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400 fill-gray-400/20" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700/20" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold font-display">{rank}</span>;
    }
  };

  const getRankStyles = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/30";
      case 2: return "bg-gray-400/10 border-gray-400/30";
      case 3: return "bg-amber-700/10 border-amber-700/30";
      default: return "bg-card border-border hover:bg-muted/50";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto min-h-[100dvh]">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-secondary/20 text-secondary rounded-full mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground tracking-tight mb-2">Eco-Points Leaderboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Recognizing the most active citizens, volunteers, and staff making our city cleaner. Earn points by reporting issues and participating in cleanups.
        </p>
      </div>

      <Card className="border-none shadow-xl bg-card overflow-hidden">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-primary-foreground">
          <span className="font-semibold tracking-wider uppercase text-sm opacity-90">Rank</span>
          <span className="font-semibold tracking-wider uppercase text-sm opacity-90">Eco-Points</span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center p-4 gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              ))
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center p-4 sm:p-6 gap-4 sm:gap-6 transition-colors border-l-4 ${getRankStyles(entry.rank)}`}
                >
                  <div className="w-8 sm:w-12 flex justify-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-sm shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <h3 className="font-bold text-lg text-foreground truncate">{entry.name}</h3>
                      <Badge variant="outline" className="w-fit text-xs capitalize">
                        {entry.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> {entry.reportsCount} Reports
                      </span>
                      {entry.badges && entry.badges.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {entry.badges.map(badge => (
                            <span key={badge} className="inline-flex items-center text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 mr-1" /> {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold font-display text-base sm:text-lg shadow-sm">
                      <Leaf className="w-4 h-4 mr-1 sm:mr-1.5" />
                      {entry.ecoPoints.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No leaderboard data available yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
