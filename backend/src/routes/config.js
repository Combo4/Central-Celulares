const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateUser = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { data: configs, error } = await supabase
      .from('site_config')
      .select('*');

    if (error) throw error;

    if (!configs || configs.length === 0) {
      return res.json({});
    }

    const configObject = {};
    configs.forEach(config => {
      configObject[config.key] = config.value;
    });

    res.json(configObject);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const { data: config, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Config not found' });
      }
      throw error;
    }

    res.json(config.value);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});


router.put('/:key', authenticateUser, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const { data: existing } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', key)
      .single();

    let configItem;
    
    if (existing) {
      const { data, error } = await supabase
        .from('site_config')
        .update({ 
          value,
          updated_by: req.adminUser.id 
        })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      configItem = data;
    } else {
      const { data, error } = await supabase
        .from('site_config')
        .insert({ 
          key, 
          value,
          updated_by: req.adminUser.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      configItem = data;
    }

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: existing ? 'UPDATE' : 'CREATE',
      entity_type: 'config',
      entity_id: key,
      changes: { before: existing?.value, after: value }
    }]);

    res.json(configItem);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

router.post('/bulk', authenticateUser, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const configUpdates = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_by: req.adminUser.id
    }));

    const { data: configItems, error } = await supabase
      .from('site_config')
      .upsert(configUpdates)
      .select();

    if (error) throw error;

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: 'BULK_UPDATE',
      entity_type: 'config',
      entity_id: 'multiple',
      changes: { updates }
    }]);

    res.json(configItems);
  } catch (error) {
    console.error('Error bulk updating config:', error);
    res.status(500).json({ error: 'Failed to bulk update configuration' });
  }
});

router.delete('/:key', authenticateUser, async (req, res) => {
  try {
    const { key } = req.params;

    const { data: configItem } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', key)
      .single();

    if (!configItem) {
      return res.status(404).json({ error: 'Config key not found' });
    }

    const { error } = await supabase
      .from('site_config')
      .delete()
      .eq('key', key);

    if (error) throw error;

    await supabase.from('audit_log').insert([{
      admin_id: req.adminUser.id,
      action: 'DELETE',
      entity_type: 'config',
      entity_id: key,
      changes: { deleted: configItem.value }
    }]);

    res.json({ message: 'Config key deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({ error: 'Failed to delete configuration key' });
  }
});

module.exports = router;
