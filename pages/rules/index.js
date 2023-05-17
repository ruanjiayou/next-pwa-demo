import React from 'react';
import { useRouter } from 'next/router'

export default function RulePage() {
  const router = useRouter();
  return <div onClick={() => router.back()}>rules</div>
}