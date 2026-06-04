import { useListVolunteers, getListVolunteersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, CheckCircle, Leaf, Star, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Volunteers() {
  const { data: volunteers, isLoading } = useListVolunteers({
    query: { queryKey: getListVolunteersQueryKey() }
  });

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto min-h-[100dvh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Volunteers & NGOs</h1>
          <p className="text-muted-foreground mt-1">The dedicated people and organizations keeping our city clean.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
          <Users className="w-4 h-4 mr-2" /> Join as Volunteer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Card key={i} className="border-border overflow-hidden">
              <div className="h-2 bg-muted w-full" />
              <CardContent className="p-6">
                <Skeleton className="w-16 h-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : volunteers && volunteers.length > 0 ? (
          volunteers.map((volunteer) => (
            <Card 
              key={volunteer.id} 
              className="border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group relative"
            >
              <div className={`h-1.5 w-full ${volunteer.type === 'ngo' ? 'bg-secondary' : 'bg-primary'}`} />
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={`capitalize ${volunteer.type === 'ngo' ? 'text-secondary border-secondary' : 'text-primary border-primary'}`}>
                    {volunteer.type}
                  </Badge>
                </div>
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${volunteer.type === 'ngo' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                  {volunteer.type === 'ngo' ? <Building2 className="w-7 h-7" /> : <User className="w-7 h-7" />}
                </div>

                <h3 className="font-bold font-display text-xl text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{volunteer.name}</h3>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4 gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{volunteer.location}</span>
                </div>

                {volunteer.specialization && (
                  <div className="mb-4 inline-flex items-center text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md">
                    <Star className="w-3 h-3 mr-1.5 text-accent-foreground" />
                    {volunteer.specialization}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Tasks</p>
                    <p className="font-bold flex items-center gap-1.5 text-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" /> {volunteer.tasksCompleted}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Points</p>
                    <p className="font-bold flex items-center gap-1.5 text-foreground">
                      <Leaf className="w-4 h-4 text-secondary" /> {volunteer.ecoPoints}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-muted/20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">No volunteers found</h3>
            <p className="text-muted-foreground text-sm">Become the first volunteer in your area.</p>
          </div>
        )}
      </div>
    </div>
  );
}
