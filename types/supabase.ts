export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  be_exponential: {
    Tables: {
      import_logs: {
        Row: {
          created_at: string | null
          details: string | null
          folder_name: string | null
          id: number
          list_name: string | null
          log_level: string
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          folder_name?: string | null
          id?: number
          list_name?: string | null
          log_level: string
          status: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          folder_name?: string | null
          id?: number
          list_name?: string | null
          log_level?: string
          status?: string
        }
        Relationships: []
      }
      report_dashboards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      report_widgets: {
        Row: {
          config: Json
          created_at: string | null
          dashboard_id: string
          id: string
          layout: Json | null
          updated_at: string | null
          widget_type: Database["be_exponential"]["Enums"]["widget_type"]
        }
        Insert: {
          config: Json
          created_at?: string | null
          dashboard_id: string
          id?: string
          layout?: Json | null
          updated_at?: string | null
          widget_type: Database["be_exponential"]["Enums"]["widget_type"]
        }
        Update: {
          config?: Json
          created_at?: string | null
          dashboard_id?: string
          id?: string
          layout?: Json | null
          updated_at?: string | null
          widget_type?: Database["be_exponential"]["Enums"]["widget_type"]
        }
        Relationships: [
          {
            foreignKeyName: "report_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "report_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_action_items: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_responsable: string | null
          due_date: string | null
          last_synced_at: string | null
          name: string | null
          priority: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_responsable?: string | null
          due_date?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_responsable?: string | null
          due_date?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tasks_documents: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_documento: string | null
          custom_estatus: string | null
          custom_fase_del_proyecto: string | null
          custom_fecha_de_firma_cierre: string | null
          last_synced_at: string | null
          name: string | null
          status: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_documento?: string | null
          custom_estatus?: string | null
          custom_fase_del_proyecto?: string | null
          custom_fecha_de_firma_cierre?: string | null
          last_synced_at?: string | null
          name?: string | null
          status?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_documento?: string | null
          custom_estatus?: string | null
          custom_fase_del_proyecto?: string | null
          custom_fecha_de_firma_cierre?: string | null
          last_synced_at?: string | null
          name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tasks_gaps: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_detalles: string | null
          custom_fecha_de_identificacion: string | null
          custom_gap_estatus: string | null
          custom_hrs_estimadas: number | null
          last_synced_at: string | null
          name: string | null
          priority: string | null
          status: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_detalles?: string | null
          custom_fecha_de_identificacion?: string | null
          custom_gap_estatus?: string | null
          custom_hrs_estimadas?: number | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_detalles?: string | null
          custom_fecha_de_identificacion?: string | null
          custom_gap_estatus?: string | null
          custom_hrs_estimadas?: number | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tasks_orders_of_change: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_costo: number | null
          custom_estatus: string | null
          custom_fecha_de_firma: string | null
          custom_impacto: string | null
          last_synced_at: string | null
          name: string | null
          priority: string | null
          status: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_costo?: number | null
          custom_estatus?: string | null
          custom_fecha_de_firma?: string | null
          custom_impacto?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_costo?: number | null
          custom_estatus?: string | null
          custom_fecha_de_firma?: string | null
          custom_impacto?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tasks_project_information: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_fase_del_proyecto: string | null
          custom_fecha_de_kick_off: string | null
          custom_fecha_planeada_go_live: string | null
          custom_horas_contratadas: number | null
          custom_horas_integraciones_o_desarrollos: number | null
          custom_horas_proyecto: number | null
          custom_project_manager: string | null
          last_synced_at: string | null
          name: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_fase_del_proyecto?: string | null
          custom_fecha_de_kick_off?: string | null
          custom_fecha_planeada_go_live?: string | null
          custom_horas_contratadas?: number | null
          custom_horas_integraciones_o_desarrollos?: number | null
          custom_horas_proyecto?: number | null
          custom_project_manager?: string | null
          last_synced_at?: string | null
          name?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_fase_del_proyecto?: string | null
          custom_fecha_de_kick_off?: string | null
          custom_fecha_planeada_go_live?: string | null
          custom_horas_contratadas?: number | null
          custom_horas_integraciones_o_desarrollos?: number | null
          custom_horas_proyecto?: number | null
          custom_project_manager?: string | null
          last_synced_at?: string | null
          name?: string | null
        }
        Relationships: []
      }
      tasks_project_plan: {
        Row: {
          assignees: string[] | null
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          due_date: string | null
          is_subtask: boolean | null
          last_synced_at: string | null
          name: string | null
          parent_task_id: string | null
          start_date: string | null
          status: string | null
          time_estimate: number | null
          time_spent: number | null
        }
        Insert: {
          assignees?: string[] | null
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          due_date?: string | null
          is_subtask?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          parent_task_id?: string | null
          start_date?: string | null
          status?: string | null
          time_estimate?: number | null
          time_spent?: number | null
        }
        Update: {
          assignees?: string[] | null
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          due_date?: string | null
          is_subtask?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          parent_task_id?: string | null
          start_date?: string | null
          status?: string | null
          time_estimate?: number | null
          time_spent?: number | null
        }
        Relationships: []
      }
      tasks_risks_issues: {
        Row: {
          clickup_folder_id: string | null
          clickup_folder_name: string | null
          clickup_list_id: string | null
          clickup_list_name: string | null
          clickup_task_id: string
          custom_action_plan: string | null
          custom_estatus: string | null
          custom_fecha_de_reporte: string | null
          custom_responsable: string | null
          custom_tipo: string | null
          last_synced_at: string | null
          name: string | null
          priority: string | null
          status: string | null
        }
        Insert: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id: string
          custom_action_plan?: string | null
          custom_estatus?: string | null
          custom_fecha_de_reporte?: string | null
          custom_responsable?: string | null
          custom_tipo?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Update: {
          clickup_folder_id?: string | null
          clickup_folder_name?: string | null
          clickup_list_id?: string | null
          clickup_list_name?: string | null
          clickup_task_id?: string
          custom_action_plan?: string | null
          custom_estatus?: string | null
          custom_fecha_de_reporte?: string | null
          custom_responsable?: string | null
          custom_tipo?: string | null
          last_synced_at?: string | null
          name?: string | null
          priority?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_log_entry: {
        Args: {
          p_details: string
          p_folder_name?: string
          p_list_name?: string
          p_log_level: string
          p_status: string
        }
        Returns: undefined
      }
      upsert_tasks_action_items: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_action_items_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_assignments: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_assignments_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_documents: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_documents_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_from_clickup: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_gaps: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_gaps_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_orders_of_change: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_orders_of_change_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_project_information: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_project_information_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_project_plan: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_project_plan_import_type"][]
        }
        Returns: undefined
      }
      upsert_tasks_risks_issues: {
        Args: {
          tasks_data: Database["be_exponential"]["CompositeTypes"]["clickup_task_risks_issues_import_type"][]
        }
        Returns: undefined
      }
    }
    Enums: {
      widget_type:
        | "bar_chart"
        | "line_chart"
        | "area_chart"
        | "pie_chart"
        | "donut_chart"
        | "kpi"
        | "table"
    }
    CompositeTypes: {
      clickup_task_action_items_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        status: string | null
        custom_responsable: string | null
        priority: string | null
        start_date: string | null
        due_date: string | null
        last_synced_at: string | null
      }
      clickup_task_assignments_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_folder_id: string | null
        clickup_space_id: string | null
        space_name: string | null
        folder_name: string | null
        list_name: string | null
        name: string | null
        status: string | null
        priority: string | null
        assignees: string[] | null
        start_date: string | null
        due_date: string | null
        time_tracked_ms: number | null
        is_subtask: boolean | null
        parent_task_id: string | null
        last_synced_at: string | null
      }
      clickup_task_documents_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        status: string | null
        custom_documento: string | null
        custom_estatus: string | null
        custom_fase_del_proyecto: string | null
        custom_fecha_de_firma_cierre: string | null
        last_synced_at: string | null
      }
      clickup_task_gaps_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        status: string | null
        custom_gap_estatus: string | null
        priority: string | null
        custom_detalles: string | null
        custom_fecha_de_identificacion: string | null
        custom_hrs_estimadas: number | null
        last_synced_at: string | null
      }
      clickup_task_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_folder_id: string | null
        clickup_space_id: string | null
        space_name: string | null
        folder_name: string | null
        list_name: string | null
        name: string | null
        status: string | null
        priority: string | null
        start_date: string | null
        due_date: string | null
        time_tracked_ms: number | null
        is_subtask: boolean | null
        parent_task_id: string | null
        last_synced_at: string | null
        custom_fecha_planeada_go_live: string | null
        custom_fecha_inicio: string | null
        custom_fecha_limite_linea_base: string | null
        custom_horas_totales: number | null
        custom_hrs_estimadas: number | null
        custom_dias_num: number | null
        custom_total_dias_num: number | null
        custom_prioridad_cliente: number | null
        custom_estado_proyecto: string | null
        custom_escalar_al: boolean | null
      }
      clickup_task_orders_of_change_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        priority: string | null
        status: string | null
        custom_impacto: string | null
        custom_estatus: string | null
        custom_costo: number | null
        custom_fecha_de_firma: string | null
        last_synced_at: string | null
      }
      clickup_task_project_information_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        custom_project_manager: string | null
        custom_fase_del_proyecto: string | null
        custom_fecha_de_kick_off: string | null
        custom_fecha_planeada_go_live: string | null
        custom_horas_contratadas: number | null
        custom_horas_proyecto: number | null
        custom_horas_integraciones_o_desarrollos: number | null
        last_synced_at: string | null
      }
      clickup_task_project_plan_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        status: string | null
        assignees: string[] | null
        start_date: string | null
        due_date: string | null
        time_spent: number | null
        time_estimate: number | null
        last_synced_at: string | null
        is_subtask: boolean | null
        parent_task_id: string | null
      }
      clickup_task_risks_issues_import_type: {
        clickup_task_id: string | null
        clickup_list_id: string | null
        clickup_list_name: string | null
        clickup_folder_id: string | null
        clickup_folder_name: string | null
        name: string | null
        custom_responsable: string | null
        priority: string | null
        status: string | null
        custom_estatus: string | null
        custom_action_plan: string | null
        custom_fecha_de_reporte: string | null
        custom_tipo: string | null
        last_synced_at: string | null
      }
    }
  }
  public: {
    Tables: {
      contratos: {
        Row: {
          created_at: string
          es_activo: boolean
          fecha_fin: string | null
          fecha_inicio: string
          id: number
          puesto: string
          tipo_contrato: Database["public"]["Enums"]["contrato_tipo"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          es_activo?: boolean
          fecha_fin?: string | null
          fecha_inicio: string
          id?: number
          puesto: string
          tipo_contrato: Database["public"]["Enums"]["contrato_tipo"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          es_activo?: boolean
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: number
          puesto?: string
          tipo_contrato?: Database["public"]["Enums"]["contrato_tipo"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Cuentas: {
        Row: {
          avatar_url: string | null
          Correo: string
          created_at: string
          departamento: string | null
          duracion_contrato: string | null
          Estado: string
          fecha_expiracion_contrato: string | null
          Nombre: string | null
          Rol: string | null
          ultimo_acceso: string | null
          UltimoAcceso: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          Correo: string
          created_at?: string
          departamento?: string | null
          duracion_contrato?: string | null
          Estado?: string
          fecha_expiracion_contrato?: string | null
          Nombre?: string | null
          Rol?: string | null
          ultimo_acceso?: string | null
          UltimoAcceso?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          Correo?: string
          created_at?: string
          departamento?: string | null
          duracion_contrato?: string | null
          Estado?: string
          fecha_expiracion_contrato?: string | null
          Nombre?: string | null
          Rol?: string | null
          ultimo_acceso?: string | null
          UltimoAcceso?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      documentos: {
        Row: {
          created_at: string | null
          id: number
          nombre_documento: string
          storage_object_path: string
          tipo_documento: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre_documento: string
          storage_object_path: string
          tipo_documento?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre_documento?: string
          storage_object_path?: string
          tipo_documento?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documentos_empleados: {
        Row: {
          id: number
          nombre_documento: string
          path_almacenamiento: string
          subido_en: string
          tamano_archivo: number | null
          tipo_documento: string | null
          tipo_mime: string | null
          user_id: string
        }
        Insert: {
          id?: number
          nombre_documento: string
          path_almacenamiento: string
          subido_en?: string
          tamano_archivo?: number | null
          tipo_documento?: string | null
          tipo_mime?: string | null
          user_id: string
        }
        Update: {
          id?: number
          nombre_documento?: string
          path_almacenamiento?: string
          subido_en?: string
          tamano_archivo?: number | null
          tipo_documento?: string | null
          tipo_mime?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_empleados_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
      permisos_saldos: {
        Row: {
          created_at: string
          dias_especiales_disponibles: number
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dias_especiales_disponibles?: number
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dias_especiales_disponibles?: number
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permisos_saldos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
      permisos_solicitudes: {
        Row: {
          aprobador_user_id: string | null
          comentarios_aprobador: string | null
          comentarios_solicitante: string | null
          created_at: string
          estado: Database["public"]["Enums"]["solicitud_estado_tipo"]
          fecha_fin: string
          fecha_inicio: string
          id: string
          motivo: Database["public"]["Enums"]["permisos_motivo_tipo"]
          solicitante_user_id: string
          total_dias: number
          updated_at: string
        }
        Insert: {
          aprobador_user_id?: string | null
          comentarios_aprobador?: string | null
          comentarios_solicitante?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["solicitud_estado_tipo"]
          fecha_fin: string
          fecha_inicio: string
          id?: string
          motivo: Database["public"]["Enums"]["permisos_motivo_tipo"]
          solicitante_user_id: string
          total_dias: number
          updated_at?: string
        }
        Update: {
          aprobador_user_id?: string | null
          comentarios_aprobador?: string | null
          comentarios_solicitante?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["solicitud_estado_tipo"]
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          motivo?: Database["public"]["Enums"]["permisos_motivo_tipo"]
          solicitante_user_id?: string
          total_dias?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permisos_solicitudes_aprobador_user_id_fkey"
            columns: ["aprobador_user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "permisos_solicitudes_solicitante_user_id_fkey"
            columns: ["solicitante_user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_logins: {
        Row: {
          id: number
          login_at: string
          user_id: string
        }
        Insert: {
          id?: number
          login_at?: string
          user_id: string
        }
        Update: {
          id?: number
          login_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vacaciones_aprobadores: {
        Row: {
          aprobador_user_id: string
          empleado_user_id: string
        }
        Insert: {
          aprobador_user_id: string
          empleado_user_id: string
        }
        Update: {
          aprobador_user_id?: string
          empleado_user_id?: string
        }
        Relationships: []
      }
      vacaciones_saldos: {
        Row: {
          dias_asignados: number
          dias_disponibles_anual: number
          dias_tomados: number
          fecha_inicio_labores: string | null
          user_id: string
        }
        Insert: {
          dias_asignados?: number
          dias_disponibles_anual?: number
          dias_tomados?: number
          fecha_inicio_labores?: string | null
          user_id: string
        }
        Update: {
          dias_asignados?: number
          dias_disponibles_anual?: number
          dias_tomados?: number
          fecha_inicio_labores?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vacaciones_solicitudes: {
        Row: {
          aprobador_user_id: string | null
          comentarios_aprobador: string | null
          created_at: string
          dias_solicitados: number
          estado: string
          fecha_decision: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          motivo: string | null
          solicitante_user_id: string
          updated_at: string
        }
        Insert: {
          aprobador_user_id?: string | null
          comentarios_aprobador?: string | null
          created_at?: string
          dias_solicitados: number
          estado?: string
          fecha_decision?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          motivo?: string | null
          solicitante_user_id: string
          updated_at?: string
        }
        Update: {
          aprobador_user_id?: string | null
          comentarios_aprobador?: string | null
          created_at?: string
          dias_solicitados?: number
          estado?: string
          fecha_decision?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          motivo?: string | null
          solicitante_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_solicitante_user_id"
            columns: ["solicitante_user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      contratos_con_semaforo: {
        Row: {
          created_at: string | null
          es_activo: boolean | null
          estado_semaforo: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: number | null
          puesto: string | null
          tipo_contrato: Database["public"]["Enums"]["contrato_tipo"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          es_activo?: boolean | null
          estado_semaforo?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: number | null
          puesto?: string | null
          tipo_contrato?: Database["public"]["Enums"]["contrato_tipo"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          es_activo?: boolean | null
          estado_semaforo?: never
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: number | null
          puesto?: string | null
          tipo_contrato?: Database["public"]["Enums"]["contrato_tipo"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Cuentas"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      get_most_viewed_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          departamento_reporte: string
          nombre_reporte: string
          view_count: number
        }[]
      }
      get_my_claim: {
        Args: { claim: string }
        Returns: Json
      }
      get_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          Nombre: string
          Rol: string
        }[]
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_peak_user_day: {
        Args: Record<PropertyKey, never>
        Returns: {
          login_day: string
          user_count: number
        }[]
      }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: string
      }
      is_team_leader: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      recalcular_dias_tomados: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      renovar_vacaciones_anualmente: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      contrato_tipo: "Indefinido" | "Temporal" | "Prácticas" | "Otro"
      permisos_motivo_tipo:
        | "Permiso días especiales"
        | "Permiso día de cumpleaños"
        | "Permiso medio día cumpleaños familiar"
        | "Permiso asuntos médicos"
        | "Licencia de matrimonio"
        | "Otro"
      solicitud_estado_tipo: "pendiente" | "aprobado" | "rechazado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  be_exponential: {
    Enums: {
      widget_type: [
        "bar_chart",
        "line_chart",
        "area_chart",
        "pie_chart",
        "donut_chart",
        "kpi",
        "table",
      ],
    },
  },
  public: {
    Enums: {
      contrato_tipo: ["Indefinido", "Temporal", "Prácticas", "Otro"],
      permisos_motivo_tipo: [
        "Permiso días especiales",
        "Permiso día de cumpleaños",
        "Permiso medio día cumpleaños familiar",
        "Permiso asuntos médicos",
        "Licencia de matrimonio",
        "Otro",
      ],
      solicitud_estado_tipo: ["pendiente", "aprobado", "rechazado"],
    },
  },
} as const
