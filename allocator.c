#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stddef.h>
#include <sys/mman.h>
#include <unistd.h>

#define MEMORY_SIZE 4096

typedef struct Block {
    size_t size;
    int is_free;
    struct Block *next;
} Block;

static void *memory_pool = NULL;
static Block *head = NULL;
static size_t allocated_blocks = 0;

#define ALIGNMENT _Alignof(max_align_t)

static size_t align_size(size_t size)
{
    size_t remainder = size % ALIGNMENT;

    if (remainder == 0)
        return size;

    return size + (ALIGNMENT - remainder);
}

static size_t header_size(void)
{
    return align_size(sizeof(Block));
}

/* Initialize the memory pool */
int initialize_allocator(void)
{
    if (memory_pool != NULL)
        return 1;

    memory_pool = mmap(
        NULL,
        MEMORY_SIZE,
        PROT_READ | PROT_WRITE,
        MAP_PRIVATE | MAP_ANONYMOUS,
        -1,
        0
    );

    if (memory_pool == MAP_FAILED) {
        perror("mmap failed");
        memory_pool = NULL;
        return 0;
    }

    head = (Block *)memory_pool;
    head->size = MEMORY_SIZE - header_size();
    head->is_free = 1;
    head->next = NULL;

    allocated_blocks = 0;

    printf("\nMemory pool initialized successfully!\n");
    printf("Total memory available: %d bytes\n", MEMORY_SIZE);

    return 1;
}

/* Allocate memory */
void *my_malloc(size_t size)
{
    if (memory_pool == NULL) {
        printf("Error: Initialize the allocator first.\n");
        return NULL;
    }

    if (size == 0) {
        printf("Error: Size must be greater than zero.\n");
        return NULL;
    }

    if (size > MEMORY_SIZE - header_size()) {
        printf("Error: Requested size is too large.\n");
        return NULL;
    }

    if (size > SIZE_MAX - (ALIGNMENT - 1)) {
        printf("Error: Requested size is too large.\n");
        return NULL;
    }

    size = align_size(size);

    Block *current = head;

    while (current != NULL) {
        if (current->is_free && current->size >= size) {

            /* Split the block if enough space remains */
            if (current->size >= size + header_size() + ALIGNMENT) {
                Block *new_block = (Block *)
                    ((char *)current + header_size() + size);

                new_block->size =
                    current->size - size - header_size();

                new_block->is_free = 1;
                new_block->next = current->next;

                current->next = new_block;
                current->size = size;
            }

            current->is_free = 0;
            allocated_blocks++;

            void *user_memory =
                (char *)current + header_size();

            printf("\nMemory allocated successfully!\n");
            printf("Requested size: %zu bytes\n", size);

            return user_memory;
        }

        current = current->next;
    }

    printf("\nAllocation failed: Not enough free memory.\n");
    return NULL;
}

/* Combine adjacent free blocks */
void coalesce_blocks(void)
{
    Block *current = head;

    while (current != NULL && current->next != NULL) {
        Block *next_block = current->next;

        if (current->is_free && next_block->is_free) {
            current->size += header_size() + next_block->size;
            current->next = next_block->next;
        } else {
            current = current->next;
        }
    }
}

/* Free allocated memory */
void my_free(void *ptr)
{
    if (ptr == NULL) {
        printf("\nNothing to free: NULL pointer.\n");
        return;
    }

    if (memory_pool == NULL) {
        printf("\nError: Memory pool is not initialized.\n");
        return;
    }

    Block *current = head;

    while (current != NULL) {
        void *user_memory =
            (char *)current + header_size();

        if (user_memory == ptr) {
            if (current->is_free) {
                printf("\nError: This memory is already free.\n");
                return;
            }

            current->is_free = 1;
            allocated_blocks--;

            coalesce_blocks();

            printf("\nMemory freed successfully!\n");
            return;
        }

        current = current->next;
    }

    printf("\nError: Invalid pointer. Memory was not freed.\n");
}

/* Display memory statistics */
void display_memory_stats(void)
{
    if (memory_pool == NULL) {
        printf("\nInitialize the allocator first.\n");
        return;
    }

    size_t allocated_memory = 0;
    size_t free_memory = 0;
    size_t free_blocks = 0;
    size_t allocated_count = 0;
    size_t metadata = 0;

    Block *current = head;

    while (current != NULL) {
        metadata += header_size();

        if (current->is_free) {
            free_memory += current->size;
            free_blocks++;
        } else {
            allocated_memory += current->size;
            allocated_count++;
        }

        current = current->next;
    }

    printf("\n========== MEMORY STATISTICS ==========\n");
    printf("Total pool size    : %d bytes\n", MEMORY_SIZE);
    printf("Allocated memory   : %zu bytes\n", allocated_memory);
    printf("Free memory        : %zu bytes\n", free_memory);
    printf("Metadata overhead  : %zu bytes\n", metadata);
    printf("Allocated blocks   : %zu\n", allocated_count);
    printf("Free blocks        : %zu\n", free_blocks);
    printf("========================================\n");
}

/* Display all memory blocks */
void display_blocks(void)
{
    if (memory_pool == NULL) {
        printf("\nInitialize the allocator first.\n");
        return;
    }

    Block *current = head;
    int index = 1;

    printf("\n========== MEMORY BLOCKS ==========\n");

    while (current != NULL) {
        printf("Block %d | Size: %zu bytes | Status: %s\n",
               index,
               current->size,
               current->is_free ? "FREE" : "ALLOCATED");

        current = current->next;
        index++;
    }

    printf("===================================\n");
}

/* Release the complete memory pool */
void my_free_pool(void)
{
    if (memory_pool == NULL) {
        printf("\nMemory pool is not initialized.\n");
        return;
    }

    if (munmap(memory_pool, MEMORY_SIZE) == -1) {
        perror("munmap failed");
        return;
    }

    memory_pool = NULL;
    head = NULL;
    allocated_blocks = 0;

    printf("\nMemory pool released successfully!\n");
}

/* Store pointers created by the user */
#define MAX_ALLOCATIONS 100

void *user_pointers[MAX_ALLOCATIONS];
int pointer_count = 0;

/* ================= MEMFORGE API ================= */

// Initialize allocator for the website
int mf_init(void)
{
    for (int i = 0; i < MAX_ALLOCATIONS; i++)
        user_pointers[i] = NULL;

    pointer_count = 0;

    return initialize_allocator();
}

// Allocate memory and return allocation ID
int mf_allocate(size_t size)
{
    if (memory_pool == NULL)
        return -1;

    int slot = -1;

    for (int i = 0; i < MAX_ALLOCATIONS; i++) {
        if (user_pointers[i] == NULL) {
            slot = i;
            break;
        }
    }

    if (slot == -1)
        return -1;

    void *ptr = my_malloc(size);

    if (ptr == NULL)
        return -1;

    user_pointers[slot] = ptr;

    return slot + 1;
}

// Free memory using allocation ID
int mf_free(int id)
{
    if (id < 1 || id > MAX_ALLOCATIONS)
        return 0;

    if (user_pointers[id - 1] == NULL)
        return 0;

    my_free(user_pointers[id - 1]);
    user_pointers[id - 1] = NULL;

    return 1;
}

// Release the complete memory pool
void mf_cleanup(void)
{
    my_free_pool();

    for (int i = 0; i < MAX_ALLOCATIONS; i++)
        user_pointers[i] = NULL;

    pointer_count = 0;
}

/* ================= MEMFORGE VISUALIZATION API ================= */

// Get total memory pool size
int mf_total_memory(void) {
    return MEMORY_SIZE;
}

// Get allocated memory
int mf_allocated_memory(void) {
    int total = 0;
    Block *current = head;

    while (current != NULL) {
        if (!current->is_free)
            total += (int)current->size;

        current = current->next;
    }

    return total;
}

// Get free memory
int mf_free_memory(void) {
    int total = 0;
    Block *current = head;

    while (current != NULL) {
        if (current->is_free)
            total += (int)current->size;

        current = current->next;
    }

    return total;
}

// Get metadata overhead
int mf_metadata_overhead(void) {
    int total = 0;
    Block *current = head;

    while (current != NULL) {
        total += (int)header_size();
        current = current->next;
    }

    return total;
}

// Get number of allocated blocks
int mf_allocated_count(void) {
    return (int)allocated_blocks;
}

// Get number of free blocks
int mf_free_count(void) {
    int count = 0;
    Block *current = head;

    while (current != NULL) {
        if (current->is_free)
            count++;

        current = current->next;
    }

    return count;
}

// Get total number of blocks
int mf_block_count(void) {
    int count = 0;
    Block *current = head;

    while (current != NULL) {
        count++;
        current = current->next;
    }

    return count;
}

// Get the size of a block using its index (0-based)
int mf_block_size(int index) {
    if (index < 0)
        return -1;

    Block *current = head;

    for (int i = 0; current != NULL; i++) {
        if (i == index)
            return (int)current->size;

        current = current->next;
    }

    return -1;
}

// Check whether a block is free
int mf_block_is_free(int index) {
    if (index < 0)
        return -1;

    Block *current = head;

    for (int i = 0; current != NULL; i++) {
        if (i == index)
            return current->is_free;

        current = current->next;
    }

    return -1;
}

// Get allocation ID of a block (0 means free)
int mf_block_id(int index) {
    if (index < 0)
        return -1;

    Block *current = head;

    for (int i = 0; current != NULL; i++) {
        if (i == index) {
            if (current->is_free)
                return 0;

            void *ptr = (char *)current + header_size();

            for (int j = 0; j < MAX_ALLOCATIONS; j++) {
                if (user_pointers[j] == ptr)
                    return j + 1;
            }

            return -1;
        }

        current = current->next;
    }

    return -1;
}

/* Interactive menu */
int main(void)
{
    int choice;
    size_t size;
    int id;

    for (int i = 0; i < MAX_ALLOCATIONS; i++)
        user_pointers[i] = NULL;

    if (!initialize_allocator())
        return 1;

    while (1) {
        printf("\n");
        printf("========================================\n");
        printf("   CUSTOM DYNAMIC MEMORY ALLOCATOR\n");
        printf("========================================\n");
        printf("1. Allocate memory\n");
        printf("2. Free memory\n");
        printf("3. Display memory statistics\n");
        printf("4. Display memory blocks\n");
        printf("5. Exit\n");
        printf("Enter your choice: ");

        if (scanf("%d", &choice) != 1) {
            printf("\nInvalid input. Please enter a number.\n");

            int ch;
            while ((ch = getchar()) != '\n' && ch != EOF) {
            }

            continue;
        }

        switch (choice) {
            case 1: {
                int slot = -1;

                for (int i = 0; i < MAX_ALLOCATIONS; i++) {
                    if (user_pointers[i] == NULL) {
                        slot = i;
                        break;
                    }
                }

                if (slot == -1) {
                    printf("\nAllocation tracking limit reached.\n");
                    break;
                }

                printf("Enter the number of bytes to allocate: ");

                if (scanf("%zu", &size) != 1) {
                    printf("Invalid size.\n");

                    int ch;
                    while ((ch = getchar()) != '\n' && ch != EOF) {
                    }

                    break;
                }

                void *ptr = my_malloc(size);

                if (ptr != NULL) {
                    user_pointers[slot] = ptr;

                    printf("Allocation ID: %d\n", slot + 1);
                    printf("Address: %p\n", ptr);
                }

                break;
            }

            case 2:
                printf("Enter the allocation ID to free: ");

                if (scanf("%d", &id) != 1) {
                    printf("Invalid ID.\n");

                    int ch;
                    while ((ch = getchar()) != '\n' && ch != EOF) {
                    }

                    break;
                }

                if (id < 1 || id > MAX_ALLOCATIONS ||
                    user_pointers[id - 1] == NULL) {
                    printf("\nInvalid ID or memory already freed.\n");
                    break;
                }

                my_free(user_pointers[id - 1]);
                user_pointers[id - 1] = NULL;

                break;

            case 3:
                display_memory_stats();
                break;

            case 4:
                display_blocks();
                break;

            case 5:
                my_free_pool();
                printf("Exiting program. Goodbye!\n");
                return 0;

            default:
                printf("\nInvalid choice. Select 1 to 5.\n");
        }
    }
}
