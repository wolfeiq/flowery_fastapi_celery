import type { Metadata } from 'next';
import Link from 'next/link';
import ShaderGradientBackground from '@/components/ShaderGradientBackground';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Scent Memory collects, uses, and protects your personal information.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPolicy() {
  return (
    
    <div className="min-h-screen relative bg-[#1a1818]">
      <ShaderGradientBackground cameraZoom={3} />
      
      <div className="relative z-10">
        <nav className="border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-8 py-6">
            <Link 
              href="/"
              className="text-sm font-light tracking-wider text-white/90 hover:text-white transition"
            >
              ← Back to Home
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="backdrop-blur-3xl bg-black/30 border border-white/10 rounded-lg p-8 md:p-12">
            <h1 
              className="text-6xl md:text-7xl font-light mb-4 text-white/90"
              style={{ fontFamily: "'HUMANE', sans-serif" }}
            >
              Impressum
            </h1>
            <p className="text-white/60 font-light mb-8">
              Legal Disclosure
            </p>

            <div className="space-y-8 text-white/80 font-light leading-relaxed">
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Information</h2>
                <div className="space-y-2">
                  <p><strong>Project Name:</strong> Flowery Fragrances: Scent Memory</p>
                  <p><strong>Legal Form:</strong> Personal Project by Maria Koryakina</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Contact Information</h2>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:info@eiq-mail.com" className="text-[#e89a9c] hover:text-white transition">
                      info@eiq-mail.com
                    </a>
                  </p>
                  <p><strong>Website:</strong> thescentmemory.com</p>
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Dispute Resolution</h2>
                <p>
                  The European Commission provides a platform for online dispute resolution (ODR): 
                  <a 
                    href="https://ec.europa.eu/consumers/odr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#e89a9c] hover:text-white transition ml-1"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
                <p className="mt-4">
                  We are not willing or obliged to participate in dispute resolution proceedings 
                  before a consumer arbitration board.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Liability for Content</h2>
                <p>
                  As a service provider, we are responsible for our own content on these pages in 
                  accordance with general legislation. However, we are not obliged to monitor transmitted 
                  or stored third-party information or to investigate circumstances that indicate illegal 
                  activity.
                </p>
                <p className="mt-4">
                  Obligations to remove or block the use of information in accordance with general 
                  legislation remain unaffected. However, liability in this regard is only possible from 
                  the point in time at which we become aware of a specific infringement. Upon notification 
                  of such violations, we will remove this content immediately.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Liability for Links</h2>
                <p>
                  Our website contains links to external third-party websites over whose content we have 
                  no influence. We therefore cannot accept any liability for this third-party content. 
                  The respective provider or operator of the pages is always responsible for the content 
                  of the linked pages.
                </p>
                <p className="mt-4">
                  The linked pages were checked for possible legal violations at the time of linking. 
                  Illegal content was not recognizable at the time of linking. However, permanent 
                  monitoring of the content of the linked pages is not reasonable without concrete 
                  evidence of an infringement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Copyright</h2>
                <p>
                  The content and works on these pages created by the site operators are subject to 
                  copyright law. The duplication, processing, distribution, and any kind of exploitation 
                  outside the limits of copyright law require the written consent of the respective author 
                  or creator.
                </p>
                <p className="mt-4">
                  Downloads and copies of this site are only permitted for private, non-commercial use. 
                  Insofar as the content on this site was not created by the operator, the copyrights of 
                  third parties are respected. In particular, third-party content is marked as such.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">Data Protection</h2>
                <p>
                  For information about how we handle your personal data, please refer to our{' '}
                  <Link href="/privacy" className="text-[#e89a9c] hover:text-white transition">
                    Privacy Policy
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="backdrop-blur-3xl bg-black/30 border border-white/10 rounded-lg p-8 md:p-12">
            <h1 
              className="text-6xl md:text-7xl font-light mb-4 text-white/90"
              style={{ fontFamily: "'HUMANE', sans-serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-white/60 font-light mb-8">
              Last Updated: January 19, 2026
            </p>

            <div className="space-y-8 text-white/80 font-light leading-relaxed">
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">1. Introduction</h2>
                <p>
                  Welcome to Scent Memory ("we," "our," or "us"). We are committed to protecting your personal 
                  information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you use our website and services.
                </p>
                <p className="mt-4">
                  By using Scent Memory, you agree to the collection and use of information in accordance with 
                  this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">2. Information We Collect</h2>
                
                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">2.1 Personal Information</h3>
                <p>We collect the following personal information that you provide to us:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Name and email address (for account creation)</li>
                  <li>Account credentials (encrypted password)</li>
                  <li>Profile preferences (fragrance preferences, intensity settings)</li>
                </ul>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">2.2 Memory Content</h3>
                <p>When you upload memories, we collect:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Photos, PDFs, and text descriptions you upload</li>
                  <li>Metadata about your memories (titles, occasions, emotions)</li>
                  <li>Extracted fragrance notes and preferences generated by our AI</li>
                </ul>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">2.3 Usage Information</h3>
                <p>We automatically collect certain information when you use our services:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Device information (browser type, operating system)</li>
                  <li>Log data (IP address, access times, pages viewed)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">3. How We Use Your Information</h2>
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>To provide and maintain our services</li>
                  <li>To process your memories and generate fragrance recommendations</li>
                  <li>To personalize your experience and improve our AI algorithms</li>
                  <li>To communicate with you about your account and service updates</li>
                  <li>To analyze usage patterns and improve our platform</li>
                  <li>To detect, prevent, and address technical issues</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">4. Data Storage and Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction. 
                  These measures include:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Limited access to personal data by authorized personnel only</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the Internet is 100% secure. While we strive to 
                  protect your personal information, we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">5. How We Share Your Information</h2>
                <p>We do not sell your personal information. We may share your information in the following situations:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, analytics, AI processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
                </ul>
                <p className="mt-4">
                  All third-party service providers are contractually obligated to maintain the confidentiality 
                  and security of your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">6. Your Privacy Rights</h2>
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                  <li><strong>Object:</strong> Object to processing of your personal data</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at{' '}
                  <a href="mailto:info@eiq-mail.com" className="text-[#e89a9c] hover:text-white transition">
                    info@eiq-mail.com
                  </a>
                </p>
              </section>


              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and store 
                  certain information. You can instruct your browser to refuse all cookies or indicate when a 
                  cookie is being sent. However, if you do not accept cookies, you may not be able to use some 
                  portions of our service.
                </p>
              </section>
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">8. Data Retention</h2>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required by law. When 
                  you delete your account, we will delete or anonymize your personal information within 30 days.
                </p>
              </section>


              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  These countries may have different data protection laws. We ensure appropriate safeguards 
                  are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">10. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under the age of 18. We do not knowingly 
                  collect personal information from children. If you believe we have collected information 
                  from a child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">11. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last Updated" date. You are 
                  advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}