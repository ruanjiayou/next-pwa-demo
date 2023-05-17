import React from 'react';
import { useRouter } from 'next/router'

export default function OfflinePage() {
  const router = useRouter();
  return <div onClick={() => router.replace('/crawler')}>rules</div>
}