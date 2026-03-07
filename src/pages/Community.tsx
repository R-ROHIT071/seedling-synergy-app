import PageLayout from "@/components/PageLayout";
import EquipmentSharing from "@/components/community/EquipmentSharing";
import Events from "@/components/community/Events";
import SuccessStories from "@/components/community/SuccessStories";
import { Card, CardContent } from "@/components/ui/card";

const Forums = () => <div className="p-6 text-center text-gray-600">Forums component coming soon</div>;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, Trophy, Users, Wrench } from "lucide-react";
import { useState } from "react";

const Community = () => {
  const [activeTab, setActiveTab] = useState("forums");

  const communityStats = [
    { icon: Users, label: "Active Farmers", value: "2,847", color: "text-blue-600" },
    { icon: MessageSquare, label: "Discussions", value: "1,234", color: "text-green-600" },
    { icon: Trophy, label: "Success Stories", value: "156", color: "text-yellow-600" },
    { icon: Calendar, label: "Events This Month", value: "23", color: "text-purple-600" },
  ];

  const quickActions = [
    {
      title: "Start a Discussion",
      description: "Share your farming experiences and get advice from the community",
      icon: MessageSquare,
      action: () => setActiveTab("forums"),
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Share Success Story",
      description: "Inspire others with your farming achievements",
      icon: Trophy,
      action: () => setActiveTab("stories"),
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      title: "Organize Event",
      description: "Create meetups, workshops, or market visits",
      icon: Calendar,
      action: () => setActiveTab("events"),
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      title: "Share Equipment",
      description: "List your farming equipment for rent",
      icon: Wrench,
      action: () => setActiveTab("equipment"),
      color: "bg-orange-50 hover:bg-orange-100"
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Farmer Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect, learn, and grow together with fellow farmers across India.
            Share knowledge, find opportunities, and build lasting relationships.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {communityStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <Card key={index} className={`${action.color} cursor-pointer transition-colors`} onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <action.icon className="h-10 w-10 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forums" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Forums
              </TabsTrigger>
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Success Stories
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Equipment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forums" className="mt-6">
              <Forums />
            </TabsContent>

            <TabsContent value="stories" className="mt-6">
              <SuccessStories />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <Events />
            </TabsContent>

            <TabsContent value="equipment" className="mt-6">
              <EquipmentSharing />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Community;