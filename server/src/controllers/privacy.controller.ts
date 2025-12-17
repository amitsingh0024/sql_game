import { Request, Response, NextFunction } from 'express';

export const privacyController = {
  async getPrivacyPolicy(_req: Request, res: Response, next: NextFunction) {
    try {
      const privacyPolicy = {
        lastUpdated: new Date().toISOString().split('T')[0],
        content: {
          title: 'Privacy Policy',
          introduction: 'This Privacy Policy describes how we collect, use, and protect your information when you use our SQL Game application.',
          sections: [
            {
              heading: '1. Information We Collect',
              content: [
                'Personal Information: We collect information you provide directly, including username, email address, and password.',
                'Game Data: We collect your game progress, achievements, scores, and gameplay statistics.',
                'Usage Data: We automatically collect information about how you interact with our game, including device information, IP address, and game session data.',
              ],
            },
            {
              heading: '2. How We Use Your Information',
              content: [
                'To provide and maintain our game services',
                'To personalize your gaming experience',
                'To track your progress and achievements',
                'To communicate with you about game updates and features',
                'To analyze and improve our game',
                'To comply with legal obligations',
              ],
            },
            {
              heading: '3. Google Ads',
              content: [
                'We use Google Ads to display advertisements in our game.',
                'Google may use cookies and similar technologies to serve ads based on your interests.',
                'You can opt out of personalized advertising by visiting Google\'s Ad Settings.',
                'For more information about how Google uses data, visit: https://policies.google.com/privacy',
              ],
            },
            {
              heading: '4. Data Security',
              content: [
                'We implement appropriate security measures to protect your personal information.',
                'Your passwords are encrypted and stored securely.',
                'We use industry-standard security protocols to protect data transmission.',
              ],
            },
            {
              heading: '5. Data Sharing',
              content: [
                'We do not sell your personal information to third parties.',
                'We may share aggregated, anonymized data for analytics purposes.',
                'We may share information with service providers who assist in operating our game.',
                'We may disclose information if required by law or to protect our rights.',
              ],
            },
            {
              heading: '6. Your Rights',
              content: [
                'You have the right to access, update, or delete your personal information.',
                'You can opt out of certain data collection and processing.',
                'You can request a copy of your data.',
                'You can deactivate your account at any time.',
              ],
            },
            {
              heading: '7. Children\'s Privacy',
              content: [
                'Our game is not intended for children under 13 years of age.',
                'We do not knowingly collect personal information from children under 13.',
                'If you believe we have collected information from a child under 13, please contact us immediately.',
              ],
            },
            {
              heading: '8. Changes to This Policy',
              content: [
                'We may update this Privacy Policy from time to time.',
                'We will notify you of any changes by posting the new policy on this page.',
                'The "Last Updated" date at the top indicates when this policy was last revised.',
              ],
            },
            {
              heading: '9. Contact Us',
              content: [
                'If you have questions about this Privacy Policy, please contact us at:',
                'Email: privacy@sqlgame.com',
                'We will respond to your inquiry within a reasonable timeframe.',
              ],
            },
          ],
        },
        googleAdsCompliance: {
          dataCollection: 'We collect data for game functionality and to serve personalized ads through Google Ads.',
          optOut: 'Users can opt out of personalized advertising through Google Ad Settings.',
          thirdPartyPolicy: 'Google\'s Privacy Policy: https://policies.google.com/privacy',
        },
      };

      res.json({
        success: true,
        data: privacyPolicy,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTermsOfService(_req: Request, res: Response, next: NextFunction) {
    try {
      const termsOfService = {
        lastUpdated: new Date().toISOString().split('T')[0],
        content: {
          title: 'Terms of Service',
          introduction: 'By using our SQL Game application, you agree to be bound by these Terms of Service.',
          sections: [
            {
              heading: '1. Acceptance of Terms',
              content: [
                'By accessing or using our game, you agree to comply with and be bound by these Terms of Service.',
                'If you do not agree to these terms, you may not use our game.',
              ],
            },
            {
              heading: '2. Use of the Game',
              content: [
                'You must be at least 13 years old to use this game.',
                'You are responsible for maintaining the confidentiality of your account.',
                'You agree not to use the game for any unlawful purpose.',
                'You agree not to attempt to gain unauthorized access to the game or its systems.',
              ],
            },
            {
              heading: '3. User Accounts',
              content: [
                'You are responsible for all activities that occur under your account.',
                'You must provide accurate and complete information when creating an account.',
                'You must notify us immediately of any unauthorized use of your account.',
              ],
            },
            {
              heading: '4. Intellectual Property',
              content: [
                'All content in the game, including but not limited to text, graphics, logos, and software, is the property of the game developers.',
                'You may not copy, modify, or distribute any content without permission.',
              ],
            },
            {
              heading: '5. Prohibited Activities',
              content: [
                'Cheating, hacking, or exploiting game mechanics',
                'Harassing or abusing other users',
                'Sharing inappropriate content',
                'Violating any applicable laws or regulations',
              ],
            },
            {
              heading: '6. Limitation of Liability',
              content: [
                'The game is provided "as is" without warranties of any kind.',
                'We are not liable for any damages arising from your use of the game.',
              ],
            },
            {
              heading: '7. Changes to Terms',
              content: [
                'We reserve the right to modify these terms at any time.',
                'Continued use of the game after changes constitutes acceptance of the new terms.',
              ],
            },
          ],
        },
      };

      res.json({
        success: true,
        data: termsOfService,
      });
    } catch (error) {
      next(error);
    }
  },
};

