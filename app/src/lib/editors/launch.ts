import { spawn, SpawnOptions } from 'child_process'
import { pathExists } from '../../ui/lib/path-exists'
import { ExternalEditorError, FoundEditor } from './shared'

/**
 * Open a given file or folder in the desired external editor.
 *
 * @param fullPath A folder or file path to pass as an argument when launching the editor.
 * @param editor The external editor to launch.
 */
export async function launchExternalEditor(
  fullPath: string,
  editor: FoundEditor
): Promise<void> {
  const editorPath = editor.path
  const exists = await pathExists(editorPath)
  if (!exists) {
    const label = __DARWIN__ ? '设置' : '设置'
    throw new ExternalEditorError(
      `找不到编辑器 '${editor.editor}' 的可执行文件 '${editor.path}'。请打开${label}并选择一个可用的编辑器。`,
      { openPreferences: true }
    )
  }

  const opts: SpawnOptions = {
    // Make sure the editor processes are detached from the Desktop app.
    // Otherwise, some editors (like Notepad++) will be killed when the
    // Desktop app is closed.
    detached: true,
  }

  if (editor.usesShell) {
    spawn(`"${editorPath}"`, [`"${fullPath}"`], { ...opts, shell: true })
  } else if (__DARWIN__) {
    // In macOS we can use `open`, which will open the right executable file
    // for us, we only need the path to the editor .app folder.
    spawn('open', ['-a', editorPath, fullPath], opts)
  } else {
    spawn(editorPath, [fullPath], opts)
  }
}
