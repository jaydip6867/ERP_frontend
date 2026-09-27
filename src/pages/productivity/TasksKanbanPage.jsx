import React, { useState, useEffect } from 'react';
import { Kanban, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { productivityService } from '../../services/productivity.service';
import { PageHeader } from '../../components/shell/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const TasksKanbanPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await productivityService.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-300' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-400' },
    { id: 'DONE', title: 'Completed', color: 'border-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productivity Task Board (Kanban)"
        subtitle="Manage cross-functional tasks, action items from meetings, and entity-linked ERP work items."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Productivity' },
          { label: 'Task Kanban' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => (t.status || 'TODO') === col.id);
          return (
            <div key={col.id} className="bg-slate-100/70 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-800">{col.title}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {loading ? (
                  <div className="text-center py-8 text-xs text-slate-400">Loading tasks...</div>
                ) : colTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">No tasks in {col.title}</div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {task.priority || 'MEDIUM'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                      )}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{task.assigned_to?.full_name || 'Staff Member'}</span>
                        {task.related_entity_type && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {task.related_entity_type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksKanbanPage;
