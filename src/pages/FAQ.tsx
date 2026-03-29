import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What is KrishiMitra?",
    answer: "KrishiMitra is a comprehensive digital platform designed to empower farmers, vendors, and agricultural stakeholders. It provides tools for marketplace trading, community engagement, price prediction, weather forecasting, yield prediction, and smart recommendations to enhance agricultural productivity and profitability."
  },
  {
    question: "How do I register on KrishiMitra?",
    answer: "You can register by clicking on the 'Sign Up' button on the homepage. Choose your role (Farmer, Vendor, or Admin) and fill in the required details including your name, email, phone number, and location. After registration, you'll need to verify your account through email or phone verification."
  },
  {
    question: "What are the different user roles on KrishiMitra?",
    answer: "KrishiMitra supports three main user roles: 1) Farmers - who can access marketplace, community features, predictions, and analytics. 2) Vendors - who can list products, manage inventory, and participate in group buying. 3) Admins - who oversee platform operations and user management."
  },
  {
    question: "How does the marketplace work?",
    answer: "The marketplace allows vendors to list agricultural products, equipment, and services. Farmers can browse, search, and purchase items. Features include cart functionality, order tracking, secure payments, and vendor verification for quality assurance."
  },
  {
    question: "What is the Community feature?",
    answer: "The Community section fosters collaboration among farmers through forums, equipment sharing, events, farmer meetups, and success stories. It's a space for knowledge sharing, networking, and collective problem-solving."
  },
  {
    question: "How accurate are the price and yield predictions?",
    answer: "Our predictions use advanced machine learning algorithms trained on historical data, current market trends, and environmental factors. While we strive for high accuracy, predictions are estimates and should be used as guidance alongside traditional farming knowledge."
  },
  {
    question: "Is KrishiMitra available in multiple languages?",
    answer: "Yes, KrishiMitra supports multiple languages including English, Hindi, and Marathi to serve diverse farming communities across regions."
  },
  {
    question: "How do I contact support if I have issues?",
    answer: "You can reach our support team through the chatbot available on all pages, or by emailing support@krishimitra.com. For urgent issues, use the in-app notification system."
  },
  {
    question: "What are the fees for using KrishiMitra?",
    answer: "Basic registration and access to community features is free. Marketplace transactions may have nominal fees, and premium analytics features are available through subscription plans. Check our pricing page for detailed information."
  },
  {
    question: "How secure is my data on KrishiMitra?",
    answer: "We implement industry-standard security measures including data encryption, secure authentication, and regular security audits. Your personal and financial data is protected with the highest security standards."
  },
  {
    question: "Can I integrate KrishiMitra with my existing farm management systems?",
    answer: "Yes, we provide APIs and integration options for popular farm management software. Contact our technical support team for integration assistance."
  },
  {
    question: "What regions does KrishiMitra currently serve?",
    answer: "KrishiMitra is currently focused on serving farmers and vendors in India, with plans for expansion to other agricultural regions. Check our website for the most up-to-date coverage areas."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <HelpCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about KrishiMitra. If you can't find what you're looking for, feel free to contact our support team.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader
                      className="pb-4"
                      onClick={() => toggleFAQ(index)}
                    >
                      <CardTitle className="flex items-center justify-between text-left">
                        <span className="text-lg">{faq.question}</span>
                        {openIndex === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {openIndex === index && (
                      <CardContent className="pt-0">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-12"
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Contact Support
                  </Button>
                  <Button className="flex items-center gap-2">
                    Chat with Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;