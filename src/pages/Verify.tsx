import PageLayout from "@/components/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Award, CheckCircle, Clock, Loader2, Upload, Video } from "lucide-react";
import { useRef, useState } from "react";

const steps = [
  { icon: Video, title: "Record Your Farm", description: "Take a short video tour of your farm showing crops and facilities." },
  { icon: Upload, title: "Upload Video", description: "Upload your verification video through our secure platform." },
  { icon: Clock, title: "Review Process", description: "Our team reviews your submission within 48 hours." },
  { icon: CheckCircle, title: "Get Verified", description: "Receive your verified badge and unlock premium features." },
];

const benefits = [
  "Higher buyer trust and more sales",
  "Priority listing in search results",
  "Access to premium group buys",
  "Verified badge on your profile",
  "Direct access to institutional buyers",
];

const faqs = [
  { q: "What should I show in the video?", a: "Show your farmland, current crops, any certifications, and storage facilities. The video should be 2-5 minutes long." },
  { q: "How long does verification take?", a: "Most verifications are completed within 48 hours of submission." },
  { q: "Is the verification free?", a: "Yes, farm verification is completely free for all KrishiMitra members." },
  { q: "Can I re-submit if rejected?", a: "Yes, you can re-submit with an updated video addressing the feedback provided." },
];

const Verify = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const logAction = async (actionType: string, entityType: string, entityId?: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) => {
    try {
      await supabase.from("admin_logs").insert({
        user_id: user?.id,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        performed_by: user?.id,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          role: 'farmer'
        }
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid format", description: "Please upload MP4, MOV, or AVI files.", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 100MB.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to upload a verification video.", variant: "destructive" });
      return;
    }
    if (!selectedFile) return;

    setUploading(true);
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 90));
    }, 300);

    const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage.from("verifications").upload(filePath, selectedFile);

    clearInterval(interval);

    if (uploadError) {
      setUploading(false);
      setUploadProgress(0);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("verifications").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("verifications").insert({
      user_id: user.id,
      video_url: urlData.publicUrl,
    });

    setUploadProgress(100);
    setUploading(false);

    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Uploaded! 🎉", description: "Your verification video has been submitted for review." });
      setSelectedFile(null);
      setUploadProgress(0);

      // Log the action
      await logAction("submit_verification", "verifications", user.id, null, {
        user_id: user.id,
        video_url: urlData.publicUrl,
        type: 'farmer'
      });
    }
  };

  return (
    <PageLayout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Trust & Transparency</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-2 text-foreground">Video Verification</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Build trust with buyers by getting your farm verified through our simple video process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-9 w-9 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-10 rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 flex flex-col items-center justify-center text-center">
              <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/x-msvideo" className="hidden" onChange={handleFileSelect} />
              <Upload className="h-16 w-16 text-primary/40 mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {selectedFile ? selectedFile.name : "Upload Your Verification Video"}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : "Drag and drop your video here, or click to browse. Max size: 100MB."}
              </p>
              {uploadProgress > 0 && (
                <div className="w-full max-w-xs mb-4">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  {selectedFile ? "Change File" : "Select Video"}
                </Button>
                {selectedFile && (
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : "Upload"}
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" /> Benefits of Verification
              </h3>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Verify;
