import React from 'react';
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default ({ value, setValue, ...props }) => (
  <ReactQuill theme="snow" value={value} onChange={setValue} style={{ height: 400 }} {...props} />
)
