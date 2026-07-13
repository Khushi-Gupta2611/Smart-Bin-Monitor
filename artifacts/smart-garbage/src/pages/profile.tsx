import {
  Mail,
  Calendar,
  Leaf,
  FileText,
  Award,
  User,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const joined =
    user.joinedAt && !isNaN(new Date(user.joinedAt).getTime())
      ? new Date(user.joinedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not Available";

  const badge =
    user.ecoPoints >= 500
      ? "Eco Champion"
      : user.ecoPoints >= 200
      ? "Eco Hero"
      : "Beginner";

async function handleSave() {
  if (name.trim().length < 2) {
    toast({
      title: "Invalid Name",
      description: "Name must contain at least 2 characters.",
      variant: "destructive",
    });
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3001/api/auth/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast({
        title: "Error",
        description: data.error || "Failed to update profile.",
        variant: "destructive",
      });
      return;
    }

    updateUser(data.user);
    setName(data.user.name);
    setOpen(false);

    toast({
      title: "Success 🎉",
      description: "Profile updated successfully.",
    });
  } catch {
    toast({
      title: "Server Error",
      description: "Please try again later.",
      variant: "destructive",
    });
  }
}

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:p-8">
      <div className="max-w-6xl w-full mx-auto">

        {/* Page Heading */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-green-900">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your account and view your activity.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Small Header */}
          <div className="h-16 md:h-20 bg-green-900"></div>

          {/* Profile */}
          <div className="px-10 pb-10">

            {/* Avatar */}
            <div className="-mt-12 flex flex-col items-center">

              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-900 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>

              <h2 className="mt-4 text-2xl md:text-3xl font-bold text-center break-words">
                {user.name}
              </h2>

              <p className="text-green-700 font-semibold capitalize">
                🌿 {user.role.replace("_", " ")}
              </p>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

              <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition flex flex-col items-center text-center">
                <Leaf className="w-8 h-8 text-green-700 mb-3" />

                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {user.ecoPoints}
                </h3>

                <p className="text-gray-500">
                  Eco Points
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition flex flex-col items-center text-center">
                <FileText className="w-8 h-8 text-blue-600 mb-3" />

                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {user.reportsCount}
                </h3>

                <p className="text-gray-500">
                  Reports Submitted
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-lg transition flex flex-col items-center text-center">
                <Award className="w-8 h-8 text-yellow-500 mb-3" />

                <h3 className="text-2xl md:text-3xl font-bold mt-2">
                  {badge}
                </h3>

                <p className="text-gray-500">
                  Badge
                </p>
              </div>

            </div>

            {/* Account Information */}
            <div className="mt-10 rounded-2xl border p-8">

              <h3 className="text-2xl font-bold text-green-900 mb-8">
                Account Information
              </h3>

              <div className="space-y-8">

                <div className="flex items-center gap-4 rounded-xl border p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="text-green-700" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="font-semibold text-lg break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="text-green-700" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Member Since
                    </p>

                    <p className="font-semibold text-base md:text-lg break-all">
                      {joined}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="text-green-700" />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Account Type
                    </p>

                    <p className="font-semibold text-lg capitalize">
                      {user.role.replace("_", " ")}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Button */}
            <div className="flex justify-center mt-10">

              <Button
                size="lg"
                className="w-full max-w-xs sm:w-auto px-10 bg-green-900 hover:bg-green-800"
                onClick={() => {
                  setName(user.name);
                  setOpen(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

            </div>

          </div>

        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Edit Profile
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">
                  Full Name
                </label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}