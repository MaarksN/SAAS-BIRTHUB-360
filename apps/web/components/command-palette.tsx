export function CommandPalette({ commands }: { commands: any[] }) {
  return (
    <div className="rounded border p-4">
      <h3>Command Palette</h3>
      <ul>
        {commands.map((cmd) => (
          <li key={cmd.id}>
            <button onClick={cmd.action}>{cmd.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
