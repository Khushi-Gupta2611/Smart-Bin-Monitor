import { useListDonations, useCreateDonation, getListDonationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartHandshake, DollarSign, Package, Briefcase, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
const formSchema = z.object({
  donorName: z.string().min(2, "Name is required"),
  type: z.enum(["money", "materials", "sponsorship"]),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Donate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: donations, isLoading } = useListDonations({
    query: { queryKey: getListDonationsQueryKey() }
  });

  const createDonation = useCreateDonation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: "",
      type: "money",
      amount: 50,
      message: "",
    },
  });

  function onSubmit(values: FormValues) {
    createDonation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Thank you for your donation!",
            description: "Your support helps keep our city clean.",
          });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListDonationsQueryKey() });
        },
        onError: () => {
          toast({
            title: "Submission failed",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      }
    );
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'money': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'materials': return <Package className="w-5 h-5 text-amber-600" />;
      case 'sponsorship': return <Briefcase className="w-5 h-5 text-blue-600" />;
      default: return <HeartHandshake className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-6xl mx-auto min-h-[100dvh]">
      <div className="text-center max-w-2xl mx-auto mb-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-full mb-4">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground tracking-tight mb-3">Support the Cause</h1>
        <p className="text-lg text-muted-foreground">
          Your donations fund cleanup drives, provide equipment to volunteers, and sustain the Eco-Points reward system. Every contribution makes a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Donation Form */}
        <Card className="shadow-lg border-primary/20 bg-card">
          <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
            <CardTitle className="text-2xl">Make a Donation</CardTitle>
            <CardDescription>Secure, fast, and impactful.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="donorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name or Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="money">Financial</SelectItem>
                            <SelectItem value="materials">Materials / Tools</SelectItem>
                            <SelectItem value="sponsorship">Event Sponsorship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} className="bg-background font-mono text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Keep up the great work..." 
                          className="bg-background resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-lg shadow-md hover:shadow-lg transition-all"
                  disabled={createDonation.isPending}
                >
                  {createDonation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <HeartHandshake className="w-5 h-5 mr-2" />
                  )}
                  Complete Donation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold font-display text-foreground">Recent Supporters</h2>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : donations && donations.length > 0 ? (
              donations.slice(0, 5).map((donation) => (
                <Card key={donation.id} className="bg-card shadow-sm border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/50">
                      {getTypeIcon(donation.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-foreground truncate">{donation.donorName}</h4>
                        <span className="font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-sm shrink-0">
                          ${donation.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{donation.type}</p>
                      {donation.message && (
                        <p className="text-sm text-foreground/80 italic border-l-2 border-muted pl-2 line-clamp-2">
                          "{donation.message}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">Be the first to donate and support the cause!</p>
              </div>
            )}
          </div>
          
          <Card className="bg-secondary/10 border-secondary/20 shadow-none">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-secondary-foreground mb-2">Corporate Sponsor?</h3>
              <p className="text-sm text-secondary-foreground/80 mb-4">Partner with us for city-wide cleanup initiatives and receive tax benefits.</p>
              <Button variant="outline" className="bg-transparent border-secondary text-secondary hover:bg-secondary/20">
                Contact Partnership Team <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
