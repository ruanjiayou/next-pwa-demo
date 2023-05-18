import React from 'react';
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";

/**
 * 代码编辑器
 * @constructor
 */
function CodeMirror({ value, onChange, language, ...props }) {

  // 编辑器挂载点
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    if (!editorRef || !editorRef.current) {
      return;
    }
    // 初始状态
    const startState = EditorState.create({
      doc: language === 'json' ? JSON.stringify(value, null, 2) : value,
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        language === 'json' ? json() : javascript(),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            onChange(v.state.toJSON().doc);
          }
        }),
      ],
      tabSize: 2,
      lineBreak: 'line-break'
    });
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
      lineWrapping: true,
    });
    return () => view.destroy();
  }, [editorRef]);

  const render = () => {
    return (<div ref={editorRef} {...props} />);
  };

  return render();

}

export default CodeMirror;