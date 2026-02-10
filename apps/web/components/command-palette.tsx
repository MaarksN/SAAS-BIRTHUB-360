export function CommandPalette({ commands }: { commands: any[] }) {
  return (
    <div className="p-4 border rounded">
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
