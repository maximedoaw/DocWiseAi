import { LexicalEditor } from "lexical";
import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";

interface ActiveEditorContextType {
    activeEditor: LexicalEditor | null;
    setActiveEditor: (editor: LexicalEditor) => void;
    registerEditor: (id: string, editor: LexicalEditor) => void;
    unregisterEditor: (id: string) => void;
    getEditor: (id: string) => LexicalEditor | undefined;
}

const ActiveEditorContext = createContext<ActiveEditorContextType | null>(null);

export function ActiveEditorProvider({ children }: { children: ReactNode }) {
    const [activeEditor, setActiveEditor] = useState<LexicalEditor | null>(null);
    const editorsRef = useRef<Map<string, LexicalEditor>>(new Map());

    const handleSetActiveEditor = useCallback((editor: LexicalEditor) => {
        setActiveEditor(editor);
    }, []);

    const registerEditor = useCallback((id: string, editor: LexicalEditor) => {
        editorsRef.current.set(id, editor);
    }, []);

    const unregisterEditor = useCallback((id: string) => {
        editorsRef.current.delete(id);
    }, []);

    const getEditor = useCallback((id: string) => {
        return editorsRef.current.get(id);
    }, []);

    return (
        <ActiveEditorContext.Provider value={{
            activeEditor,
            setActiveEditor: handleSetActiveEditor,
            registerEditor,
            unregisterEditor,
            getEditor
        }}>
            {children}
        </ActiveEditorContext.Provider>
    );
}

export function useActiveEditor() {
    const context = useContext(ActiveEditorContext);
    if (!context) {
        throw new Error("useActiveEditor must be used within an ActiveEditorProvider");
    }
    return context;
}
