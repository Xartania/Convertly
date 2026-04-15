#include <stddef.h>
#include "convertly.h"

static size_t handle_args(void) {
  return SUCCESS;
}

int maint() {
  switch (handle_args()) {
    case HELP:
      return SUCCESS;
    case ERROR:
      return ERROR;
    default:
      return SUCCESS;
  }
}
