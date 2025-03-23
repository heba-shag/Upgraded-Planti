import React, { useState } from 'react';
import { Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css'; // أنماط المحرر
import { Header } from '../components';

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Editor" />
      <div style={{ border: '1px solid #ddd', padding: '10px', minHeight: '500px' }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder="Write something amazing..."
        />
      </div>
    </div>
  );
};

export default DraftEditor;