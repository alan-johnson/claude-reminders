#include "pebble_process_info.h"
#include "src/resource_ids.auto.h"

const PebbleProcessInfo __pbl_app_info __attribute__ ((section (".pbl_header"))) = {
  .header = "PBLAPP",
  .struct_version = { PROCESS_INFO_CURRENT_STRUCT_VERSION_MAJOR, PROCESS_INFO_CURRENT_STRUCT_VERSION_MINOR },
  .sdk_version = { PROCESS_INFO_CURRENT_SDK_VERSION_MAJOR, PROCESS_INFO_CURRENT_SDK_VERSION_MINOR },
  .process_version = { 1, 0 },
  .load_size = 0xb6b6,
  .offset = 0xb6b6b6b6,
  .crc = 0xb6b6b6b6,
  .name = "Pebble Reminders",
  .company = "Handsbreadth",
  .icon_resource_id = DEFAULT_MENU_ICON,
  .sym_table_addr = 0xA7A7A7A7,
  .flags = PROCESS_INFO_PLATFORM_APLITE,
  .num_reloc_entries = 0xdeadcafe,
  .uuid = { 0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6, 0x4A, 0x5B, 0x8C, 0x9D, 0x0E, 0x1F, 0x2A, 0x3B, 0x4C, 0x5D },
  .virtual_size = 0xb6b6
};
