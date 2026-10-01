'use client';
import React from 'react';
import './Footer.css';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Instagram, 
  WhatsApp, 
  Google, 
  Facebook 
} from '@mui/icons-material';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid px-5">
        <div className="footerContainer">
          
          {/* Brand Column */}
          <div className="brandColumn">
            <div className="logo">
              <Image src="/logo.png" alt="Anevix Logo" width={60} height={60} />
            </div>
            <p className="description Poppins-regular">
              Your one-stop destination for trendy fashion, electronics & lifestyle products. 
              Anevix culture is steeped in fostering trust, inclusion, support, recognition 
              and genuine care that enables Anevix to create, innovate, and bring their best selves to work.
            </p>
          </div>

          {/* Company Column */}
          <div className="column">
            <h4 className="columnTitle Poppins-regular">Company</h4>
            <ul className="linkList">
              {['About Us', 'Careers', 'Anevix Stories', 'Press Releases', 'Corporate Information'].map(item => (
                <li key={item} className="linkItem Poppins-regular">
                  <Link href="#" className="link">{item}</Link>
                </li>
              ))}
            </ul>
            <h4 className="columnTitle Poppins-regular mt-4">Policy</h4>
            <ul className="linkList">
              {['Privacy Policy', 'Terms and Conditions', 'Anevix Stories'].map(item => (
                <li key={item} className="linkItem Poppins-regular">
                  <Link href="#" className="link">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Make Money Column */}
          <div className="column">
            <h4 className="columnTitle Poppins-regular">Make Money with Us</h4>
            <ul className="linkList">
              {[
                'Sell on Anevix', 'Sell under Anevix Accelerator', 'Anevix Global Selling', 
                'Protect and build your brand', 'Become an Affiliate', 'Fulfilment by Anevix', 
                'Supply to Anevix', 'Advertise your Products', 'Anevix pay on Merchants'
              ].map(item => (
                <li key={item} className="linkItem">
                  <Link href="#" className="link">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Address & Social Column */}
          <div className="addressColumn">
            <div className="addressSubColumn">
              <h4 className="columnTitle Poppins-regular">Mail Us:</h4>
              <p className="addressText Poppins-regular">
                Anevix Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India
              </p>
              
              <h4 className="columnTitle Poppins-regular mt-4">Social:</h4>
              <div className="socialIcons">
                <Instagram className="socialIcon" />
                <WhatsApp className="socialIcon" />
                <Google className="socialIcon" />
                <Facebook className="socialIcon" />
              </div>
            </div>

            <div className="addressSubColumn">
              <h4 className="columnTitle Poppins-regular">Registered Office Address:</h4>
              <p className="addressText">
                Anevix Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India<br/>
                CIN : YU49K8853J8J07<br/>
                Telephone: 0098-567878 / 7898-07467
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bottomBar">
          <div className="copyright Poppins-regular">
            © {new Date().getFullYear()} Anevix. All rights reserved.
          </div>
          <div className="bottomLinks">
            <Link href="#" className="bottomLink Poppins-regular">Privacy Policy</Link>
            <Link href="#" className="bottomLink Poppins-regular">Terms & Conditions</Link>
            <Link href="#" className="bottomLink Poppins-regular">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
