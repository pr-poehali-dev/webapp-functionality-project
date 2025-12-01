import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Course } from './types';

interface CourseDialogProps {
  course: Course | null;
  onClose: () => void;
  onCompleteLesson: (courseId: number, lessonId: number) => void;
}

export default function CourseDialog({ course, onClose, onCompleteLesson }: CourseDialogProps) {
  if (!course) return null;

  const getLessonIcon = (type: 'video' | 'text' | 'quiz') => {
    switch (type) {
      case 'video':
        return 'PlayCircle';
      case 'text':
        return 'FileText';
      case 'quiz':
        return 'ClipboardCheck';
      default:
        return 'Circle';
    }
  };

  return (
    <Dialog open={!!course} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            <div className="flex gap-4 mb-4">
              <Badge variant="outline">{course.category}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon name="Clock" size={14} />
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс курса</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          </div>

          {course.lessons && course.lessons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Уроки</h3>
              <div className="space-y-2">
                {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      lesson.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        lesson.completed ? 'bg-green-500/10' : 'bg-primary/10'
                      }`}>
                        <Icon
                          name={lesson.completed ? 'CheckCircle2' : getLessonIcon(lesson.type)}
                          size={20}
                          className={lesson.completed ? 'text-green-600' : 'text-primary'}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={lesson.completed ? 'outline' : 'default'}
                      onClick={() => onCompleteLesson(course.id, lesson.id)}
                    >
                      {lesson.completed ? 'Повторить' : 'Начать'}
                      <Icon name="ArrowRight" size={14} className="ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
