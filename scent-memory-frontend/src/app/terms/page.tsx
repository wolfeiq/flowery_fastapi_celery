import type { Metadata } from 'next';
import Link from 'next/link';
import ShaderGradientBackground from '@/components/ShaderGradientBackground';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Read the terms and conditions for using Scent Memory services.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsOfUse() {
  return (
    <div className="min-h-screen relative bg-[#1a1818]">
      <ShaderGradientBackground cameraZoom={3} />
      
      <div className="relative z-10">
        {/* Header */}
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

        {/* Content */}
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="backdrop-blur-3xl bg-black/30 border border-white/10 rounded-lg p-8 md:p-12">
            <h1 
              className="text-6xl md:text-7xl font-light mb-4 text-white/90"
              style={{ fontFamily: "'HUMANE', sans-serif" }}
            >
              Terms of Use
            </h1>
            <p className="text-white/60 font-light mb-8">
              Last Updated: January 19, 2026
            </p>

            <div className="space-y-8 text-white/80 font-light leading-relaxed">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">1. Agreement to Terms</h2>
                <p>
                  Welcome to Scent Memory. These Terms of Use ("Terms") govern your access to and use of our 
                  website, services, and applications (collectively, the "Service"). By accessing or using the 
                  Service, you agree to be bound by these Terms.
                </p>
                <p className="mt-4">
                  If you do not agree to these Terms, you may not access or use the Service. We reserve the 
                  right to modify these Terms at any time, and such modifications will be effective immediately 
                  upon posting.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">2. Eligibility</h2>
                <p>
                  You must be at least 18 years old to use this Service. By using the Service, you represent 
                  and warrant that you meet this age requirement and have the legal capacity to enter into 
                  these Terms.
                </p>
              </section>

              {/* Account Registration */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">3. Account Registration</h2>
                <p>To use certain features of the Service, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
                <p className="mt-4">
                  You may not use another user's account without permission, and you may not share your 
                  account credentials with others.
                </p>
              </section>

              {/* User Content */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">4. User Content and Ownership</h2>
                
                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">4.1 Your Content</h3>
                <p>
                  You retain all ownership rights to the content you upload, including photos, PDFs, and 
                  text descriptions ("User Content"). By uploading User Content, you grant us a worldwide, 
                  non-exclusive, royalty-free license to use, process, and store your User Content solely 
                  for the purpose of providing the Service.
                </p>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">4.2 Content Restrictions</h3>
                <p>You agree not to upload User Content that:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Violates any law or regulation</li>
                  <li>Infringes on intellectual property rights of others</li>
                  <li>Contains harmful, threatening, or abusive material</li>
                  <li>Contains personal information of others without consent</li>
                  <li>Contains viruses, malware, or other harmful code</li>
                  <li>Impersonates any person or entity</li>
                </ul>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">4.3 Content Removal</h3>
                <p>
                  We reserve the right to remove any User Content that violates these Terms or is otherwise 
                  objectionable, at our sole discretion and without notice.
                </p>
              </section>

              {/* Service Use */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">5. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Use automated systems (bots, scrapers) without permission</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Remove or modify any proprietary notices</li>
                  <li>Use the Service to compete with us</li>
                  <li>Resell or redistribute the Service without authorization</li>
                </ul>
              </section>

              {/* AI-Generated Content */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">6. AI-Generated Recommendations</h2>
                <p>
                  Our Service uses artificial intelligence to analyze your memories and generate fragrance 
                  recommendations. You acknowledge that:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>AI recommendations are suggestions only and may not be accurate</li>
                  <li>We do not guarantee the quality or suitability of recommended fragrances</li>
                  <li>You use recommendations at your own discretion and risk</li>
                  <li>We are not responsible for your purchasing decisions based on recommendations</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">7. Intellectual Property Rights</h2>
                <p>
                  The Service and its original content (excluding User Content), features, and functionality 
                  are owned by Flowery Fragrances and are protected by international copyright, trademark, 
                  patent, trade secret, and other intellectual property laws.
                </p>
                <p className="mt-4">
                  Our trademarks, service marks, and logos may not be used without our prior written consent. 
                  All other trademarks are the property of their respective owners.
                </p>
              </section>

              {/* Third-Party Services */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">8. Third-Party Services and Links</h2>
                <p>
                  The Service may contain links to third-party websites or services that are not owned or 
                  controlled by us. We have no control over and assume no responsibility for the content, 
                  privacy policies, or practices of any third-party services.
                </p>
                <p className="mt-4">
                  You acknowledge and agree that we shall not be responsible or liable for any damage or 
                  loss caused by your use of any third-party services.
                </p>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">9. Disclaimers</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR 
                  A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p className="mt-4">
                  We do not warrant that:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>The Service will be uninterrupted, secure, or error-free</li>
                  <li>Results obtained from the Service will be accurate or reliable</li>
                  <li>The quality of any products or services obtained through the Service will meet your expectations</li>
                  <li>Any errors in the Service will be corrected</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">10. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL FLOWERY FRAGRANCES, ITS DIRECTORS, 
                  EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                  PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Your use or inability to use the Service</li>
                  <li>Any unauthorized access to your data</li>
                  <li>Any conduct or content of third parties on the Service</li>
                  <li>Any content obtained from the Service</li>
                </ul>
                <p className="mt-4">
                  Our total liability shall not exceed the amount you paid us in the past 12 months, or 
                  $100, whichever is greater.
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">11. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless Flowery Fragrances and its officers, 
                  directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, 
                  including reasonable attorneys' fees, arising out of or in any way connected with:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Your access to or use of the Service</li>
                  <li>Your User Content</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">12. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without 
                  prior notice, for any reason, including if you breach these Terms.
                </p>
                <p className="mt-4">
                  Upon termination, your right to use the Service will immediately cease. If you wish to 
                  terminate your account, you may do so through your account settings or by contacting us.
                </p>
                <p className="mt-4">
                  All provisions of these Terms that by their nature should survive termination shall survive, 
                  including ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">13. Governing Law and Dispute Resolution</h2>
                <p>
                  These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its 
                  conflict of law provisions. Any disputes arising from these Terms or the Service shall be 
                  resolved through binding arbitration in accordance with [Arbitration Rules], except that 
                  either party may seek injunctive relief in court.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">14. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will provide notice of material 
                  changes by posting the new Terms on this page and updating the "Last Updated" date. Your 
                  continued use of the Service after such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              {/* General */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">15. General Provisions</h2>
                
                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">15.1 Entire Agreement</h3>
                <p>
                  These Terms constitute the entire agreement between you and Flowery Fragrances regarding 
                  the Service and supersede all prior agreements.
                </p>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">15.2 Severability</h3>
                <p>
                  If any provision of these Terms is found to be unenforceable, that provision shall be 
                  limited or eliminated to the minimum extent necessary, and the remaining provisions shall 
                  remain in full force and effect.
                </p>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">15.3 Waiver</h3>
                <p>
                  No waiver of any term of these Terms shall be deemed a further or continuing waiver of 
                  such term or any other term.
                </p>

                <h3 className="text-xl font-light mb-3 text-white/90 mt-6">15.4 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms without our prior written consent. We may 
                  assign these Terms without restriction.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-light mb-4 text-[#e89a9c]">16. Contact Us</h2>
                <p>If you have questions about these Terms, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:info@eiq-mail.com" className="text-[#e89a9c] hover:text-white transition">
                      info@eiq-mail.com
                    </a>
                  </p>
                  <p><strong>Project Name:</strong> Flowery Fragrances</p>
                </div>
              </section>

              {/* Acknowledgment */}
              <section className="border-t border-white/10 pt-6 mt-8">
                <p className="text-sm text-white/60">
                  By using Scent Memory, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms of Use.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}