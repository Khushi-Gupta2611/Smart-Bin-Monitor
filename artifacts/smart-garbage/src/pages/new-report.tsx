import { useCreateReport } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Camera, AlertCircle, Loader2 } from "lucide-react";
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Please provide more details in the description"),
  category: z.enum(["garbage", "illegal_dumping", "water_pollution", "burning_waste", "toxic_waste"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().min(5, "Location must be at least 5 characters"),
  reporterName: z.string().min(2, "Name is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "garbage",
      severity: "medium",
      location: "",
      reporterName: "",
      imageUrl: "",
    },
  });

  const createReport = useCreateReport();

  function onSubmit(values: FormValues) {
    createReport.mutate(
      { data: values },
      {
        onSuccess: (report) => {
          toast({
            title: "Report Submitted Successfully",
            description: `Thank you, ${report.reporterName}! You earned ${report.ecoPointsAwarded} Eco-Points.`,
          });
          setLocation(`/report/${report.id}`);
        },
        onError: () => {
          toast({
            title: "Failed to submit report",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="flex flex-col items-center py-10 px-4 md:px-8 max-w-4xl mx-auto min-h-[100dvh]">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-display tracking-tight text-foreground mb-3">Report an Issue</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Help keep our community clean. Provide details about the environmental issue so our crews can resolve it quickly.
        </p>
      </div>

      <Card className="w-full shadow-lg border-border">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="w-5 h-5 text-primary" />
            Issue Details
          </CardTitle>
          <CardDescription>Fill out the form below with as much detail as possible.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reporterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Overflowing trash bin near park entrance" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="garbage">Garbage</SelectItem>
                          <SelectItem value="illegal_dumping">Illegal Dumping</SelectItem>
                          <SelectItem value="water_pollution">Water Pollution</SelectItem>
                          <SelectItem value="burning_waste">Burning Waste</SelectItem>
                          <SelectItem value="toxic_waste">Toxic Waste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - Minor nuisance</SelectItem>
                          <SelectItem value="medium">Medium - Needs attention</SelectItem>
                          <SelectItem value="high">High - Health/Safety risk</SelectItem>
                          <SelectItem value="critical">Critical - Immediate danger</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="123 Main St, Central Park" className="pl-10 bg-background" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe the issue, extent of the mess, and any hazards present..." 
                        className="min-h-[120px] bg-background resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Camera className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://example.com/photo.jpg" className="pl-10 bg-background" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto min-w-[200px] text-base h-12 shadow-md"
                  disabled={createReport.isPending}
                >
                  {createReport.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
