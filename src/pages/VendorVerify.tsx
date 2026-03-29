import PageLayout from "@/components/PageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, Clock, FileText, Loader2, ShieldCheck, Upload } from "lucide-react";
import { useRef, useState } from "react";

const steps = [
  { icon: FileText, title: "Provide Business Details", description: "Enter your business information and ID number." },
  { icon: Upload, title: "Upload ID Document", description: "Upload a photo of your government-issued ID." },
  { icon: Clock, title: "Review Process", description: "Our team reviews your submission within 48 hours." },
  { icon: CheckCircle, title: "Get Verified", description: "Receive your verified vendor badge and start selling." },
];

const benefits = [
  "Sell products on the platform",
  "Manage your inventory and orders",
  "Create group buy opportunities",
  "Access to farmer network",
  "Verified badge for trust",
];

const faqs = [
  { q: "What ID documents are accepted?", a: "Government-issued ID like passport, driver's license, or business registration certificate." },
  { q: "How long does verification take?", a: "Most verifications are completed within 48 hours of submission." },
  { q: "Is the verification free?", a: "Yes, vendor verification is completely free for all KrishiMitra vendors." },
  { q: "Can I re-submit if rejected?", a: "Yes, you can re-submit with updated documents addressing the feedback provided." },
];

const VendorVerify = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ idNumber: "", businessName: "", businessType: "" });



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid format", description: "Please upload JPEG or PNG files.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !form.idNumber || !form.businessName) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('vendor-verifications')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { error } = await supabase.from('verifications').insert({
        user_id: user.id,
        status: 'pending',
        video_url: ''
      });

      if (error) throw error;

      toast({ title: "Submitted successfully", description: "Your verification is under review." });
      setSelectedFile(null);
      setForm({ idNumber: "", businessName: "", businessType: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageLayout>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Vendor Verification</h1>
            <p className="text-muted-foreground mb-8">Get verified as a vendor to start selling on KrishiMitra</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-2xl font-semibold mb-6">Verification Steps</h2>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-semibold mb-6">Benefits</h2>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Submit Verification</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    placeholder="Enter your ID number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    placeholder="e.g., Seeds, Fertilizers, Equipment"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="document">Upload ID Document</Label>
                  <Input
                    id="document"
                    type="file"
                    ref={fileRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </Button>
                </div>
                <Button type="submit" disabled={uploading || !selectedFile}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Submit for Verification
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Accordion type="single" collapsible className="mt-12">
              <AccordionItem value="faq">
                <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i}>
                        <h4 className="font-medium">{faq.q}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default VendorVerify;