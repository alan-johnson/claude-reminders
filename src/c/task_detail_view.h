#ifndef TASK_DETAIL_VIEW_H
#define TASK_DETAIL_VIEW_H

#include <pebble.h>

// Initialize detail window (called from main init)
void task_detail_view_init(void);

// Cleanup detail window (called from deinit)
void task_detail_view_deinit(void);

// Show task detail for currently selected task
void task_detail_view_show(void);

// Get detail window pointer
Window* task_detail_view_get_window(void);

#endif // TASK_DETAIL_VIEW_H
