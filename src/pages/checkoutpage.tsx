import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { paymentService } from '../../services/paymentService';
import { stripeService } from '../Stripe/api/stripe.config';
import { 
  FiCheck, FiLock, FiAlertCircle, FiCreditCard, FiShield, 
  FiArrowLeft, FiUsers, FiStar, FiClock, FiAward, FiThumbsUp,
  FiCheckCircle, FiCheckSquare, FiDollarSign, FiSlash, FiBarChart2, FiX,
  FiRotateCcw, FiSearch, FiFileText, FiPhone, FiBell, FiCalendar,
  FiTrendingUp, FiFilter, FiLink, FiMail, FiInbox, FiUnlock,
  FiPackage, FiRefreshCw, FiHeadphones, FiGift, FiZap
} from 'react-icons/fi';
import { BsCash } from 'react-icons/bs'; 