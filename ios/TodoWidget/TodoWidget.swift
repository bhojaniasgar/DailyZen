import WidgetKit
import SwiftUI

struct TaskEntry: TimelineEntry {
    let date: Date
    let tasks: [Task]
}

struct Task: Codable, Identifiable {
    let id: String
    let title: String
    let priority: String
    var completed: Bool
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> TaskEntry {
        TaskEntry(date: Date(), tasks: [
            Task(id: "1", title: "Example Task", priority: "medium", completed: false)
        ])
    }
    
    func getSnapshot(in context: Context, completion: @escaping (TaskEntry) -> Void) {
        let entry = TaskEntry(date: Date(), tasks: [
            Task(id: "1", title: "Example Task", priority: "medium", completed: false)
        ])
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskEntry>) -> Void) {
        guard let userDefaults = UserDefaults(suiteName: "group.com.dailyzen.widget") else {
            return
        }
        
        if let tasksData = userDefaults.data(forKey: "tasks"),
           let tasks = try? JSONDecoder().decode([Task].self, from: tasksData) {
            let entry = TaskEntry(date: Date(), tasks: tasks)
            let timeline = Timeline(entries: [entry], policy: .after(.now.advanced(by: 60 * 5))) // Update every 5 minutes
            completion(timeline)
        } else {
            let entry = TaskEntry(date: Date(), tasks: [])
            let timeline = Timeline(entries: [entry], policy: .after(.now.advanced(by: 60 * 5)))
            completion(timeline)
        }
    }
}

struct TodoWidgetEntryView : View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tasks")
                .font(.headline)
                .padding(.bottom, 4)
            
            if entry.tasks.isEmpty {
                Text("No tasks")
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.tasks.prefix(3)) { task in
                    HStack {
                        Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(task.completed ? .green : .gray)
                        Text(task.title)
                            .strikethrough(task.completed)
                            .lineLimit(1)
                        Spacer()
                        Circle()
                            .fill(priorityColor(task.priority))
                            .frame(width: 8, height: 8)
                    }
                }
            }
        }
        .padding()
    }
    
    func priorityColor(_ priority: String) -> Color {
        switch priority {
        case "high": return .red
        case "medium": return .orange
        case "low": return .green
        default: return .gray
        }
    }
}

@main
struct TodoWidget: Widget {
    let kind: String = "TodoWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            TodoWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Tasks")
        .description("View and manage your tasks")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
